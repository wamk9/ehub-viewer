// Organization and team reports (EhubReportBuilder).
export default {
  "title": "Reports",
  "sub_org": "Your organization in numbers: registrations, revenue, events, results and staff.",
  "sub_team": "Your team in numbers: roster, events, results and applications.",
  "col_name": "Layout",
  "col_data": "Data",
  "col_last": "Last run",
  "tab_ready": "Ready-made",
  "tab_saved": "My layouts",
  "new": "Build a report",
  "generate": "Generate",
  "edit": "Customize",
  "run": "Open",
  "delete": "Delete",
  "back": "Back",
  "never": "Never generated",
  "last_run": "Generated {date}",
  "by": "by {name}",
  "saved_empty": "You have not saved any layout yet. Build a report and click “Save layout” to reuse it later.",
  "delete_q": "Delete the layout “{name}”? No data is deleted, only the layout.",
  "deleted": "Layout deleted.",
  "saved": "Layout saved!",
  "error": "Could not generate the report.",
  "builder": {
    "title": "Build a report",
    "name": "Layout name",
    "name_ph": "e.g. Pending registrations this month",
    "dataset": "What do you want to see?",
    "mode": "Format",
    "mode_list": "Detailed list",
    "mode_group": "Grouped summary",
    "columns": "Columns",
    "columns_hint": "Tick the columns and use the arrows to change their order.",
    "group_by": "Group by",
    "filters": "Filters",
    "period": "Period",
    "from": "From",
    "to": "To",
    "event": "Event",
    "all_events": "All events",
    "status": "Status",
    "all_status": "All",
    "sort": "Sort by",
    "sort_default": "Default",
    "asc": "Ascending",
    "desc": "Descending",
    "chart": "Chart",
    "chart_bar": "Bars",
    "chart_none": "No chart",
    "save": "Save layout",
    "save_new": "Save as new",
    "name_required": "Give the layout a name to save it.",
    "sensitive": "E-mail and phone are only shown to people allowed to see registration data. Use them only for event matters.",
    "move_up": "Move column up",
    "move_down": "Move column down"
  },
  "periods": {
    "all": "All time",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "365d": "Last 12 months",
    "month": "This month",
    "last_month": "Last month",
    "year": "This year",
    "custom": "Pick dates"
  },
  "result": {
    "rows": "{n} rows",
    "total": "Total",
    "count": "Count",
    "sum": "Sum",
    "empty": "No data for these filters.",
    "truncated": "Showing the first 5,000 rows. Use filters to narrow it down.",
    "csv": "Download spreadsheet (CSV)",
    "print": "Print / PDF",
    "generated_at": "Generated on {date}",
    "group": "Group",
    "no_value": "(no value)"
  },
  "datasets": {
    "registrations": {
      "label": "Registrations",
      "desc": "Who registered, payment status, check-in and final placing."
    },
    "revenue": {
      "label": "Revenue",
      "desc": "Paid, confirmed registrations with amount and payment method."
    },
    "refunds": {
      "label": "Refunds",
      "desc": "Refund requests, amounts and status."
    },
    "events": {
      "label": "Events",
      "desc": "Each event with spots, registrations, check-ins and revenue."
    },
    "results": {
      "label": "Results",
      "desc": "Placings and points in each stage."
    },
    "members": {
      "label": "Members",
      "desc": "People on the management team and their roles."
    },
    "followers": {
      "label": "Followers",
      "desc": "New followers per period (no names)."
    },
    "applications": {
      "label": "Applications",
      "desc": "Requests to join the team and what was decided."
    }
  },
  "team_datasets": {
    "members": {
      "label": "Roster",
      "desc": "Members, role and how many events each played."
    },
    "events": {
      "label": "Events",
      "desc": "Events the team entered and its final placing."
    },
    "results": {
      "label": "Results",
      "desc": "Team placings and points in each published stage."
    }
  },
  "presets": {
    "registrations_by_event": {
      "label": "Registrations by event",
      "desc": "How many registered and how much came in for each event."
    },
    "registrations_by_month": {
      "label": "Registrations by month",
      "desc": "How registrations evolve over time."
    },
    "revenue_by_month": {
      "label": "Revenue by month",
      "desc": "Paid registrations revenue each month."
    },
    "revenue_by_event": {
      "label": "Revenue by event",
      "desc": "Which events brought in the most."
    },
    "events_overview": {
      "label": "Events overview",
      "desc": "Spots, registrations, check-ins and revenue per event."
    },
    "checkin": {
      "label": "Attendance (check-in)",
      "desc": "How many participants showed up."
    },
    "refunds": {
      "label": "Refunds",
      "desc": "Every refund request and its status."
    },
    "members": {
      "label": "Management team",
      "desc": "People per role in the organization."
    },
    "followers": {
      "label": "New followers",
      "desc": "Followers gained per month."
    },
    "results": {
      "label": "Results",
      "desc": "All placings, published and draft."
    },
    "roster": {
      "label": "Roster",
      "desc": "Members, roles and event participation."
    },
    "team_events": {
      "label": "Events played",
      "desc": "Team events and final placing."
    },
    "team_results": {
      "label": "Results",
      "desc": "Every team placing in published stages."
    },
    "team_results_by_event": {
      "label": "Results by event",
      "desc": "How many stages the team played in each event."
    },
    "applications": {
      "label": "Applications",
      "desc": "Requests by status: pending, accepted and rejected."
    }
  },
  "groups": {
    "event": "Event",
    "status": "Status",
    "month": "Month",
    "gateway": "Payment method",
    "category": "Sport",
    "checked_in": "Checked in",
    "currency": "Currency",
    "reason": "Reason",
    "situation": "Progress",
    "format": "Format",
    "stage": "Stage",
    "role": "Role",
    "position": "Placing"
  },
  "cols": {
    "participant": "Participant",
    "username": "Username",
    "mail": "E-mail",
    "phone": "Phone",
    "team": "Team",
    "event": "Event",
    "category": "Sport",
    "status": "Status",
    "gateway": "Paid via",
    "amount": "Amount",
    "currency": "Currency",
    "checked_in": "Check-in",
    "final_position": "Final placing",
    "registered_at": "Registered on",
    "confirmed_at": "Confirmed on",
    "requested_at": "Requested on",
    "reason": "Reason",
    "refunded_at": "Refunded on",
    "format": "Format",
    "start_at": "Starts",
    "publication": "Publication",
    "situation": "Progress",
    "spots": "Spots",
    "registrations": "Registered",
    "confirmed": "Confirmed",
    "pending": "Pending",
    "waitlist": "Waiting list",
    "stages": "Stages",
    "fee": "Entry fee",
    "revenue": "Revenue",
    "stage": "Stage",
    "position": "Placing",
    "score": "Points",
    "qualified": "Qualified",
    "published": "Published",
    "member": "Person",
    "role": "Role",
    "joined_at": "Since",
    "followed_at": "Followed on",
    "is_admin": "Admin",
    "events": "Events",
    "organization": "Organization",
    "date": "Date",
    "win": "Win",
    "podium": "Podium",
    "applicant": "Applicant",
    "desired_role": "Desired role",
    "applied_at": "Sent on",
    "group": "Group",
    "count": "Count",
    "total": "Total amount"
  },
  "v": {
    "yes": "Yes",
    "no": "No",
    "status": {
      "free": "Free",
      "confirmed": "Confirmed",
      "pending": "Pending",
      "failed": "Failed",
      "cancelled": "Cancelled",
      "refunded": "Refunded"
    },
    "gateway": {
      "stripe": "Card (Stripe)",
      "mercadopago": "Mercado Pago",
      "manual": "Arranged with organizer",
      "paypal": "PayPal"
    },
    "refund_status": {
      "awaiting_payment": "Awaiting payment",
      "pending": "In progress",
      "refunded": "Refunded",
      "failed": "Failed"
    },
    "refund_reason": {
      "participant": "Participant request",
      "organizer": "Removed by organizer",
      "late_payment": "Paid after the deadline"
    },
    "publication": {
      "draft": "Draft",
      "published": "Published",
      "unlisted": "Unlisted",
      "private": "Private"
    },
    "situation": {
      "open": "Open / not started",
      "running": "In progress",
      "finished": "Finished"
    },
    "format": {
      "points": "Points",
      "bracket": "Knockout",
      "groups": "Groups + final",
      "time": "Time"
    },
    "application_status": {
      "pending": "Pending",
      "accepted": "Accepted",
      "rejected": "Rejected"
    }
  }
}
