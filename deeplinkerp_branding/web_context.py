BRAND_BASE_TEMPLATE = "deeplinkerp_branding/templates/deeplinkerp_branding_base.html"


def update_context(context):
	"""Use the Deeplinkerp base template where Frappe would use the default base."""
	base_template_path = context.get("base_template_path")
	if base_template_path and base_template_path != "templates/base.html":
		return {}
	return {"base_template_path": BRAND_BASE_TEMPLATE}
