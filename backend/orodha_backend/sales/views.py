import csv

from django.utils import timezone
from django.db import connection
from django.db.models import Sum, Count
from django.http import HttpResponse, JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response # Added back for JSON rendering support
from rest_framework import permissions, viewsets, status

from .models import SaleLog
from .permissions import SaleLogPermission
from .serializers import SaleLogSerializer
from ..accounts.models import UserProfile
from ..inventory.models import Hub

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


class SaleLogViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for tenant sale records.

    select_related() keeps list/detail responses efficient by fetching the
    linked BookItem and salesperson in the same query.
    """

    queryset = SaleLog.objects.select_related("book_item", "salesperson").order_by("id")
    serializer_class = SaleLogSerializer
    permission_classes = [permissions.AllowAny] # Temporary debug rule

    def get_queryset(self):
        queryset = SaleLog.objects.select_related("book_item", "salesperson").order_by("id")
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "ADMIN":
            return queryset
        if role == "MANAGER" and getattr(user, "hub_id", None):
            return queryset.filter(salesperson__hub_id=user.hub_id)
        if role == "MERCHANDISER":
            return queryset.filter(salesperson=user)
        return queryset.none()
    
    def perform_create(self, serializer):
        # 1. Save the sale log record natively
        sale_log = serializer.save(salesperson=self.request.user)
        
        # 2. Automatically grab the linked physical book item
        book_item = sale_log.book_item
        
        # 3. Mutate the database status to SOLD and save
        book_item.status = "SOLD"
        book_item.save()

    '''Temp endpoint debug'''
    def list(self, request, *args, **kwargs):
        print("========== SALES ENDPOINT ==========")
        print("SCHEMA:", connection.schema_name)
        print("USER:", request.user)
        print("AUTH:", request.auth)
        print("IS AUTHENTICATED:", request.user.is_authenticated)
        print("ROLE:", getattr(request.user, "role", None))
        print("===================================")
        return super().list(request, *args, **kwargs)


class ReportingDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        hub_name = "All Hubs"
        agent_name = "All Merchandisers"

        # SECURITY RULE: Instantly lock out base Merchandisers from loading financials
        if getattr(user, "role", None) not in ["ADMIN", "MANAGER"]:
            return HttpResponse("Unauthorized", status=403)

        # 1. Gather URL query string filter parameters
        hub_id = request.query_params.get("hub_id")
        merchandiser_id = request.query_params.get("merchandiser_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        export_format = request.query_params.get("export_format")

        if hub_id:
            hub = Hub.objects.filter(id=hub_id).first()
            if hub:
                hub_name = hub.name

        if merchandiser_id:
            agent = UserProfile.objects.filter(id=merchandiser_id).first()
            if agent:
                agent_name = agent.username

        start_display = start_date or "Beginning"
        end_display = end_date or timezone.localdate().isoformat()

        queryset = SaleLog.objects.select_related("book_item__product", "salesperson").all()

        if user.role == "MANAGER" and getattr(user, "hub_id", None):
            queryset = queryset.filter(salesperson__hub_id=user.hub_id)
        elif user.role == "ADMIN" and hub_id:
            queryset = queryset.filter(salesperson__hub_id=hub_id)

        if merchandiser_id:
            queryset = queryset.filter(salesperson_id=merchandiser_id)
        if start_date:
            queryset = queryset.filter(sold_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sold_at__date__lte=end_date)

        # DEFAULT APP SUMMARY METRICS (JSON API CALL FALLBACK)
        metrics = queryset.aggregate(
            total_revenue=Sum("sale_price"),
            total_items_sold=Count("id")
        )

        total_revenue = metrics["total_revenue"] or 0
        total_sales = metrics["total_items_sold"] or 0
        average_sale = (
            total_revenue / total_sales if total_sales else 0
        )

        top_merchandisers = (
            queryset.values("salesperson__username")
            .annotate(revenue=Sum("sale_price"), count=Count("id"))
            .order_by("-revenue")[:5]
        )

        # STREAM OUT STANDARD EXCEL-COMPATIBLE CSV
        if export_format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="myBook_sales_report.csv"'
            
            writer = csv.writer(response)
            writer.writerow([])
            writer.writerow(["Generated By", user.username])
            writer.writerow(["Generated On", timezone.localtime().strftime("%Y-%m-%d %H:%M")])
            writer.writerow([])
            writer.writerow(["Filters"])
            writer.writerow(["Hub", hub_name])
            writer.writerow(["Merchandiser", agent_name])
            writer.writerow(["Start Date", start_display])
            writer.writerow(["End Date", end_display])
            writer.writerow([])
            writer.writerow(["Summary"])
            writer.writerow(["Total Sales", total_sales])
            writer.writerow(["Total Revenue (KES)", f"{total_revenue:,.2f}"])
            writer.writerow(["Average Sale (KES)", f"{average_sale:,.2f}"])
            writer.writerow([])
            writer.writerow(["Receipt ID", "Timestamp", "Product Title", "Merchandiser", "Price (KES)"])
            
            for log in queryset:
                writer.writerow([
                    f"REC-{log.id}",
                    log.sold_at.strftime("%Y-%m-%d %H:%M"),
                    log.book_item.product.title if log.book_item else "Unknown",
                    log.salesperson.username if log.salesperson else "System",
                    log.sale_price
                ])

            writer.writerow([])
            writer.writerow(["TOTAL", "", "", "", f"{total_revenue:,.2f}"])

            return response

        # GENERATE AND STREAM CLEAN CORPORATE PDF
        elif export_format == "pdf":
            try:
                response = HttpResponse(content_type="application/pdf")
                response["Content-Disposition"] = 'attachment; filename="myBook_sales_report.pdf"'
                
                doc = SimpleDocTemplate(response, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
                story = []
                styles = getSampleStyleSheet()
                
                title_style = ParagraphStyle('ReportTitle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor('#1E3A8A'), spaceAfter=12)
                meta_style = ParagraphStyle('ReportMeta', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#4B5563'), spaceAfter=20)
                
                story.append(Paragraph("myBook Ledger Systems - Sales Report", title_style))
                story.append(Paragraph(f"Generated By Account: {user.username} | Records Compiled: {queryset.count()} logs found.", meta_style))
                story.append(Spacer(1, 10))
                
                table_data = [["Receipt ID", "Timestamp", "Product Title", "Merchandiser", "Price (KES)"]]
                for log in queryset:
                    table_data.append([
                        f"#REC-{log.id}",
                        log.sold_at.strftime("%Y-%m-%d %H:%M"),
                        (log.book_item.product.title[:24] + '...') if log.book_item and len(log.book_item.product.title) > 24 else (log.book_item.product.title if log.book_item else "N/A"),
                        log.salesperson.username if log.salesperson else "-",
                        f"{log.sale_price:,.2f}"
                    ])
                table_data.append([
                    "",
                    "",
                    "",
                    "TOTAL",
                    f"{total_revenue:,.2f}"
                ])
                last_row = len(table_data) - 1
                ("BACKGROUND", (0,last_row), (-1,last_row), colors.HexColor("#DBEAFE")),
                ("FONTNAME", (0,last_row), (-1,last_row), "Helvetica-Bold"),

                report_table = RLTable(table_data, colWidths=[60, 90, 180, 100, 100])
                report_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563EB')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('ALIGN', (-1,0), (-1,-1), 'RIGHT'), 
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,0), 10),
                    ('BOTTOMPADDING', (0,0), (-1,0), 8),
                    ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F9FAFB')),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F3F4F6')]), 
                    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,1), (-1,-1), 9),
                ]))
                
                # Append the completed table to the story flow array and execute the document build stream
                story.append(report_table)
                story.append(Spacer(1, 10))
                story.append(
                    Paragraph(
                        f"""
                        <b>Generated By:</b> {user.username}<br/>
                        <b>Generated On:</b> {timezone.now():%Y-%m-%d %H:%M}<br/>
                        <b>Hub:</b> {hub_name}<br/>
                        <b>Merchandiser:</b> {agent_name}<br/>
                        <b>Start Date</b> {start_display}<br/>
                        <b>End Date</b> {end_display}<br/>
                        <b>Total Sales:</b> {total_sales}<br/>
                        <b>Total Revenue:</b> KES {total_revenue:,.2f}<br/>
                        <b>Average Sale:</b> KES {average_sale:,.2f}
                        """,
                        styles["Normal"],
                    )
                )

                story.append(Spacer(1, 18))
                doc.build(story)
                return response
            except Exception as e:
                return JsonResponse(
                    {
                        "detail": "The PDF report could not be generated.",
                        "code": "PDF_GENERATION_FAILED",
                    },
                    status=500,
                )

        # 🔑 THE FIX: Restored the baseline json endpoint rendering dictionary block
        return Response({
            "summary": {
                "total_revenue": metrics["total_revenue"] or 0.00,
                "total_items_sold": metrics["total_items_sold"] or 0,
            },
            "top_performing_agents": list(top_merchandisers)
        }, status=status.HTTP_200_OK)
