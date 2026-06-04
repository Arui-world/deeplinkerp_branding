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
	const translate = (text) => (typeof window.__ === "function" ? __(text) : text);
	const getBrandName = () => translate(DeeplinkERPBrandName);
	const getSettingsName = () => translate(DeeplinkERPSettingsName);
	const getFrameworkName = () => translate(DLPFrameworkName);


	function replaceERPNextAppTitle() {
		if (!window.frappe?.boot) return;

		(frappe.boot.app_data || []).forEach((app) => {
			if (app.app_name === "erpnext" || app.app_title === ERPNextBrandName || app.app_title === DeeplinkERPBrandName) {
				app.app_title = getBrandName();
			}
			if (app.app_name === "frappe" || app.app_title === FrappeFrameworkName || app.app_title === DLPFrameworkName) {
				app.app_title = getFrameworkName();
			}
			if (ProductAppNames.has(app.app_name)) {
				app.app_title = getBrandName();
			}
		});

		if (frappe.current_app?.app_name === "erpnext") {
			frappe.current_app.app_title = getBrandName();
		}
		if (frappe.current_app?.app_name === "frappe") {
			frappe.current_app.app_title = getFrameworkName();
		}
		if (ProductAppNames.has(frappe.current_app?.app_name)) {
			frappe.current_app.app_title = getBrandName();
		}
	}

	function replaceBootLabels() {
		if (!window.frappe?.boot) return;

		const settingsSidebar = frappe.boot.workspace_sidebar_item?.["erpnext settings"];
		if (settingsSidebar) {
			settingsSidebar.label = getSettingsName();
			settingsSidebar.title = getSettingsName();
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
				workspace.label = getSettingsName();
				workspace.title = getSettingsName();
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
			[ERPNextBrandName]: getBrandName(),
			[DeeplinkERPBrandName]: getBrandName(),
			[ERPNextSettingsName]: getSettingsName(),
			[DeeplinkERPSettingsName]: getSettingsName(),
			[FrappeFrameworkName]: getFrameworkName(),
			[DLPFrameworkName]: getFrameworkName(),
		};

		if (frappe.app?.sidebar?.header_subtitle === FrappeFrameworkName || frappe.app?.sidebar?.header_subtitle === DLPFrameworkName) {
			frappe.app.sidebar.header_subtitle = getFrameworkName();
		}
		if (ProductSidebarSubtitles.has(frappe.app?.sidebar?.header_subtitle)) {
			frappe.app.sidebar.header_subtitle = getBrandName();
		}

		document.querySelectorAll(".title-container").forEach((container) => {
			const title = container.querySelector(".header-title")?.textContent.trim();
			const subtitle = container.querySelector(".header-subtitle");
			if (subtitle && ProductSidebarTitles.has(title)) {
				subtitle.textContent = getBrandName();
			}
		});

		document.querySelectorAll(".header-subtitle").forEach((subtitle) => {
			const text = subtitle.textContent.trim();
			if (text === ERPNextBrandName || ProductSidebarSubtitles.has(text)) subtitle.textContent = getBrandName();
			if (text === FrappeFrameworkName || text === DLPFrameworkName) subtitle.textContent = getFrameworkName();
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

	const BackButtonClass = "deeplinkerp-desk-back-button";

	function isDeskRoute() {
		const path = window.location.pathname || "";
		return path === "/app" || path.startsWith("/app/") || path === "/desk" || path.startsWith("/desk/");
	}

	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		if (window.frappe?.set_route) {
			frappe.set_route("desk", "home");
		} else {
			window.location.href = "/desk/home";
		}
	}

	function makeBackButton() {
		const label = translate("返回");
		const tooltip = translate("返回上一页");
		const icon = window.frappe?.utils?.icon
			? frappe.utils.icon("left", "sm")
			: '<span aria-hidden="true">&larr;</span>';

		const button = document.createElement("button");
		button.type = "button";
		button.className = `btn btn-default btn-sm ${BackButtonClass}`;
		button.title = tooltip;
		button.setAttribute("aria-label", tooltip);
		button.innerHTML = `<span class="deeplinkerp-back-icon">${icon}</span><span class="deeplinkerp-back-label">${label}</span>`;
		button.addEventListener("click", goBack);
		return button;
	}

	function addBackButtonStyles() {
		if (document.getElementById("deeplinkerp-desk-back-button-style")) return;

		const style = document.createElement("style");
		style.id = "deeplinkerp-desk-back-button-style";
		style.textContent = `
			.${BackButtonClass} {
				align-items: center;
				display: inline-flex;
				gap: 4px;
				margin-right: 8px;
				white-space: nowrap;
			}

			.${BackButtonClass} .deeplinkerp-back-icon {
				align-items: center;
				display: inline-flex;
			}

			@media (max-width: 767px) {
				.${BackButtonClass} .deeplinkerp-back-label {
					display: none;
				}
			}
		`;
		document.head.appendChild(style);
	}

	function addBackButton() {
		if (!isDeskRoute()) {
			document.querySelectorAll(`.${BackButtonClass}`).forEach((button) => button.remove());
			return;
		}

		document.querySelectorAll(".standard-actions").forEach((actions) => {
			if (actions.querySelector(`.${BackButtonClass}`)) return;

			const button = makeBackButton();
			const menu = actions.querySelector(".menu-btn-group");
			if (menu) {
				actions.insertBefore(button, menu);
			} else {
				actions.prepend(button);
			}
		});
	}

	function setupBackButton() {
		addBackButtonStyles();
		setTimeout(addBackButton, 0);
		setTimeout(addBackButton, 250);
	}

	function patchSidebarSubtitle() {
		if (!window.frappe?.ui?.Sidebar || frappe.ui.Sidebar.prototype.__deeplinkerpPatched) return;

		const originalChooseAppName = frappe.ui.Sidebar.prototype.choose_app_name;
		frappe.ui.Sidebar.prototype.choose_app_name = function (...args) {
			const result = originalChooseAppName.apply(this, args);
			if (this.header_subtitle === FrappeFrameworkName || this.header_subtitle === DLPFrameworkName) {
				this.header_subtitle = getFrameworkName();
			}
			if (
				ProductSidebarTitles.has(this.sidebar_title) ||
				ProductSidebarTitles.has(this.workspace_title) ||
				ProductSidebarSubtitles.has(this.header_subtitle) ||
				ProductAppNames.has(frappe.current_app?.app_name)
			) {
				this.header_subtitle = getBrandName();
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
			setupBackButton();
			observeSidebarHeader();
		});
	} else {
		patchSidebarSubtitle();
		applyBranding();
		setupBackButton();
		observeSidebarHeader();
	}

	if (window.frappe?.router?.on) {
		frappe.router.on("change", () => {
			applyBranding();
			setupBackButton();
		});
	}

	if (window.frappe?.after_ajax) {
		frappe.after_ajax(() => {
			applyBranding();
			setupBackButton();
		});
	}

	[100, 500, 1000, 2000].forEach((delay) => {
		setTimeout(() => {
			patchSidebarSubtitle();
			applyBranding();
			setupBackButton();
		}, delay);
	});
})();
