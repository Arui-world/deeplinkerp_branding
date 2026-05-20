(function () {
	const ERPNextBrandName = "ERPNext";
	const DeeplinkERPBrandName = "Deeplinkerp";
	const ERPNextSettingsName = "ERPNext Settings";
	const DeeplinkERPSettingsName = "Deeplinkerp Settings";
	const ProductAppNames = new Set(["ai_assistant", "mes_integration"]);
	const ProductSidebarTitles = new Set(["AI Assistant", "Mes Integration", "MES Integration", "MES Integration Log"]);
	const ProductSidebarSubtitles = new Set(["AI Assistant", "Mes Integration", "MES Integration", "MES Integration Log"]);
	const FrappeFrameworkName = "Frappe Framework";
	const DLPFrameworkName = "DLP Framework";

	function replaceERPNextAppTitle() {
		if (!window.frappe?.boot) return;

		(frappe.boot.app_data || []).forEach((app) => {
			if (app.app_name === "erpnext" || app.app_title === ERPNextBrandName) {
				app.app_title = DeeplinkERPBrandName;
			}
			if (app.app_name === "frappe" || app.app_title === FrappeFrameworkName) {
				app.app_title = DLPFrameworkName;
			}
			if (ProductAppNames.has(app.app_name)) {
				app.app_title = DeeplinkERPBrandName;
			}
		});

		if (frappe.current_app?.app_name === "erpnext") {
			frappe.current_app.app_title = DeeplinkERPBrandName;
		}
		if (frappe.current_app?.app_name === "frappe") {
			frappe.current_app.app_title = DLPFrameworkName;
		}
		if (ProductAppNames.has(frappe.current_app?.app_name)) {
			frappe.current_app.app_title = DeeplinkERPBrandName;
		}
	}

	function replaceBootLabels() {
		if (!window.frappe?.boot) return;

		const settingsSidebar = frappe.boot.workspace_sidebar_item?.["erpnext settings"];
		if (settingsSidebar) {
			settingsSidebar.label = DeeplinkERPSettingsName;
			settingsSidebar.title = DeeplinkERPSettingsName;
		}

		Object.entries(frappe.boot.workspace_sidebar_item || {}).forEach(([key, sidebar]) => {
			if (ProductSidebarTitles.has(sidebar.label) || ProductSidebarTitles.has(sidebar.module) || ProductSidebarTitles.has(key)) {
				sidebar.app = sidebar.app || (sidebar.label === "AI Assistant" ? "ai_assistant" : "mes_integration");
			}
		});

		frappe.boot.module_app = frappe.boot.module_app || {};
		Object.assign(frappe.boot.module_app, {
			"ai assistant": "ai_assistant",
			ai_assistant: "ai_assistant",
			"mes integration": "mes_integration",
			mes_integration: "mes_integration",
			"mes integration log": "mes_integration",
			mes_integration_log: "mes_integration",
		});

		(frappe.boot.workspaces?.pages || []).forEach((workspace) => {
			if (
				workspace.name === ERPNextSettingsName ||
				workspace.label === ERPNextSettingsName ||
				workspace.title === ERPNextSettingsName
			) {
				workspace.label = DeeplinkERPSettingsName;
				workspace.title = DeeplinkERPSettingsName;
			}
		});
	}

	function replaceTextContent(selector, replacements) {
		document.querySelectorAll(selector).forEach((element) => {
			const text = element.textContent.trim();
			if (replacements[text]) {
				element.textContent = replacements[text];
			}
		});
	}

	function replaceDisplayAttributes(replacements) {
		const attributes = ["title", "data-original-title", "aria-label", "alt"];
		document.querySelectorAll("[title], [data-original-title], [aria-label], [alt]").forEach((element) => {
			attributes.forEach((attribute) => {
				const value = element.getAttribute(attribute);
				if (replacements[value]) {
					element.setAttribute(attribute, replacements[value]);
				}
			});
		});
	}

	function replaceVisibleBranding() {
		const replacements = {
			[ERPNextBrandName]: DeeplinkERPBrandName,
			[ERPNextSettingsName]: DeeplinkERPSettingsName,
			[FrappeFrameworkName]: DLPFrameworkName,
		};

		if (frappe.app?.sidebar?.header_subtitle === FrappeFrameworkName) {
			frappe.app.sidebar.header_subtitle = DLPFrameworkName;
		}
		if (ProductSidebarSubtitles.has(frappe.app?.sidebar?.header_subtitle)) {
			frappe.app.sidebar.header_subtitle = DeeplinkERPBrandName;
		}

		document.querySelectorAll(".title-container").forEach((container) => {
			const title = container.querySelector(".header-title")?.textContent.trim();
			const subtitle = container.querySelector(".header-subtitle");
			if (subtitle && ProductSidebarTitles.has(title)) {
				subtitle.textContent = DeeplinkERPBrandName;
			}
		});

		document.querySelectorAll(".header-subtitle").forEach((subtitle) => {
			const text = subtitle.textContent.trim();
			if (text === ERPNextBrandName || ProductSidebarSubtitles.has(text)) subtitle.textContent = DeeplinkERPBrandName;
			if (text === FrappeFrameworkName) subtitle.textContent = DLPFrameworkName;
		});

		replaceTextContent(
			[
				".sidebar-item-label",
				".sidebar-item-title",
				".icon-title",
				".menu-item-title",
				".workspace-title",
				".title-text",
				".ellipsis",
				".awesomplete [role='option']",
			].join(", "),
			replacements
		);

		replaceDisplayAttributes(replacements);
	}

	function applyBranding() {
		replaceERPNextAppTitle();
		replaceBootLabels();
		replaceVisibleBranding();
	}

	function patchSidebarSubtitle() {
		if (!window.frappe?.ui?.Sidebar || frappe.ui.Sidebar.prototype.__deeplinkerpPatched) return;

		const originalChooseAppName = frappe.ui.Sidebar.prototype.choose_app_name;
		frappe.ui.Sidebar.prototype.choose_app_name = function (...args) {
			const result = originalChooseAppName.apply(this, args);
			if (this.header_subtitle === FrappeFrameworkName) {
				this.header_subtitle = DLPFrameworkName;
			}
			if (
				ProductSidebarTitles.has(this.sidebar_title) ||
				ProductSidebarTitles.has(this.workspace_title) ||
				ProductSidebarSubtitles.has(this.header_subtitle) ||
				ProductAppNames.has(frappe.current_app?.app_name)
			) {
				this.header_subtitle = DeeplinkERPBrandName;
			}
			return result;
		};
		frappe.ui.Sidebar.prototype.__deeplinkerpPatched = true;
	}

	function observeSidebarHeader() {
		if (!document.body) return;

		new MutationObserver(applyBranding).observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true,
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			patchSidebarSubtitle();
			applyBranding();
			observeSidebarHeader();
		});
	} else {
		patchSidebarSubtitle();
		applyBranding();
		observeSidebarHeader();
	}

	if (window.frappe?.router?.on) {
		frappe.router.on("change", applyBranding);
	}

	if (window.frappe?.after_ajax) {
		frappe.after_ajax(applyBranding);
	}

	[100, 500, 1000, 2000].forEach((delay) => {
		setTimeout(() => {
			patchSidebarSubtitle();
			applyBranding();
		}, delay);
	});
})();
