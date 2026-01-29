def format_currency(amount, currency='USD'):
    return f"${amount:,.2f}"

def format_percentage(value):
    return f"{value:.2f}%"

def format_date(date):
    return date.strftime('%Y-%m-%d %H:%M:%S')