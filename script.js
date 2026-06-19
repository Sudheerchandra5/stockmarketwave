(() => {
    const selectors = {
        header: "[data-site-header]",
        calculatorTab: "[data-calculator-tab]",
        calculatorPanel: "[data-calculator-panel]",
        calculatorCard: "[data-calculator-card]",
        calculatorLibraryLink: ".calculator-name-list a",
        genericCalculatorTitle: "[data-generic-calculator-title]",
        genericCalculatorCategory: "[data-generic-calculator-category]",
        genericCalculatorDescription: "[data-generic-calculator-description]",
        formulaCalculator: "[data-formula-calculator]",
        stockProfitForm: "[data-stock-profit-form]",
        year: "#year",
    };

    const stateClasses = {
        active: "is-active",
        highlighted: "is-highlighted",
        headerScrolled: "is-scrolled",
    };

    const setFooterYear = () => {
        const yearElement = document.querySelector(selectors.year);

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    const setHeaderScrollState = () => {
        const header = document.querySelector(selectors.header);

        if (!header) {
            return;
        }

        header.classList.toggle(stateClasses.headerScrolled, window.scrollY > 8);
    };

    const formatNumber = (value, options = {}) => {
        const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options,
        });

        return formatter.format(Number.isFinite(value) ? value : 0);
    };

    const bindResetToDefaults = (form, calculate) => {
        const resetButtons = [...form.querySelectorAll('button[type="reset"], input[type="reset"]')];

        resetButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();

                [...form.elements].forEach((field) => {
                    if (!field.name) {
                        return;
                    }

                    if (field.type === "checkbox" || field.type === "radio") {
                        field.checked = field.defaultChecked;
                        return;
                    }

                    field.value = field.defaultValue;
                });

                calculate();
            });
        });

        form.addEventListener("reset", () => {
            window.setTimeout(calculate, 0);
        });
    };

    const slugify = (value) => value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const getRootPath = () => (window.location.pathname.includes("/calculators/") ? "../" : "");

    const prettifyCategory = (category) => {
        const labels = {
            stocks: "Stocks calculator",
            "mutual-funds": "Mutual funds calculator",
            etfs: "ETFs calculator",
        };

        return labels[category] || "Calculator";
    };

    const initializeCalculatorLibraryLinks = () => {
        const links = [...document.querySelectorAll(selectors.calculatorLibraryLink)];

        links.forEach((link) => {
            if (link.getAttribute("href") !== "#") {
                return;
            }

            const panel = link.closest("[data-calculator-panel]");
            const category = panel?.dataset.calculatorPanel || "stocks";
            const title = link.textContent.trim();
            const params = new URLSearchParams({
                category,
                calculator: slugify(title),
                title,
            });

            link.href = `${getRootPath()}calculator.html?${params.toString()}`;
        });
    };

    const initializeGenericCalculatorPage = () => {
        const titleElement = document.querySelector(selectors.genericCalculatorTitle);

        if (!titleElement) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const title = params.get("title") || "Calculator";
        const category = params.get("category") || "";
        const categoryElement = document.querySelector(selectors.genericCalculatorCategory);
        const descriptionElement = document.querySelector(selectors.genericCalculatorDescription);

        titleElement.textContent = title;
        document.title = `${title} - StockMarketWave`;

        if (categoryElement) {
            categoryElement.textContent = prettifyCategory(category);
        }

        if (descriptionElement) {
            descriptionElement.textContent = `${title} will use manual inputs first, then show instant results, formulas, and related calculators.`;
        }
    };

    const initializeStockProfitCalculator = () => {
        const form = document.querySelector(selectors.stockProfitForm);

        if (!form) {
            return;
        }

        const outputs = [...document.querySelectorAll("[data-stock-profit-output]")];
        const bars = [...document.querySelectorAll("[data-stock-profit-bar]")];

        const getNumber = (fieldName) => {
            const field = form.elements[fieldName];
            const value = Number.parseFloat(field?.value || "0");
            return Number.isFinite(value) ? value : 0;
        };

        const setOutput = (name, value) => {
            outputs
                .filter((output) => output.dataset.stockProfitOutput === name)
                .forEach((output) => {
                    output.textContent = value;
                });
        };

        const updateChartBars = (totalCost, totalProceeds) => {
            const maxValue = Math.max(totalCost, totalProceeds, 1);

            bars.forEach((bar) => {
                const value = bar.dataset.stockProfitBar === "cost" ? totalCost : totalProceeds;
                const width = Math.max((value / maxValue) * 100, 4);
                bar.style.width = `${width}%`;
            });
        };

        const calculate = () => {
            const buyPrice = getNumber("buyPrice");
            const sellPrice = getNumber("sellPrice");
            const shares = getNumber("shares");
            const buyFees = getNumber("buyFees");
            const sellFees = getNumber("sellFees");
            const totalFees = buyFees + sellFees;

            const grossCost = buyPrice * shares;
            const totalCost = grossCost + buyFees;
            const totalProceeds = sellPrice * shares - sellFees;
            const profitLoss = totalProceeds - totalCost;
            const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
            const breakEven = shares > 0 ? (grossCost + totalFees) / shares : 0;

            setOutput("profitLoss", formatNumber(profitLoss));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("totalProceeds", formatNumber(totalProceeds));
            setOutput("breakEven", formatNumber(breakEven));
            setOutput("chartCost", formatNumber(totalCost));
            setOutput("chartProceeds", formatNumber(totalProceeds));
            updateChartBars(totalCost, totalProceeds);
        };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            calculate();
        });
        bindResetToDefaults(form, calculate);

        calculate();
    };

    const bindCalculatorForm = (formSelector, outputAttribute, calculateValues) => {
        const form = document.querySelector(formSelector);

        if (!form) {
            return;
        }

        const outputs = [...document.querySelectorAll(`[${outputAttribute}]`)];

        const getNumber = (fieldName) => {
            const field = form.elements[fieldName];
            const value = Number.parseFloat(field?.value || "0");
            return Number.isFinite(value) ? value : 0;
        };

        const setOutput = (name, value) => {
            outputs
                .filter((output) => output.getAttribute(outputAttribute) === name)
                .forEach((output) => {
                    output.textContent = value;
                });
        };

        const calculate = () => {
            calculateValues({ getNumber, setOutput });
        };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            calculate();
        });
        bindResetToDefaults(form, calculate);

        calculate();
    };

    const initializeStockBatchCalculators = () => {
        bindCalculatorForm("[data-stock-average-form]", "data-stock-average-output", ({ getNumber, setOutput }) => {
            const lots = [1, 2, 3].map((index) => ({
                shares: getNumber(`shares${index}`),
                price: getNumber(`price${index}`),
            }));
            const fees = getNumber("fees");
            const totalShares = lots.reduce((sum, lot) => sum + lot.shares, 0);
            const grossCost = lots.reduce((sum, lot) => sum + (lot.shares * lot.price), 0);
            const totalCost = grossCost + fees;
            const averagePrice = totalShares > 0 ? totalCost / totalShares : 0;

            setOutput("averagePrice", formatNumber(averagePrice));
            setOutput("totalShares", formatNumber(totalShares, { maximumFractionDigits: 0, minimumFractionDigits: 0 }));
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-stock-breakeven-form]", "data-stock-breakeven-output", ({ getNumber, setOutput }) => {
            const buyPrice = getNumber("buyPrice");
            const shares = getNumber("shares");
            const buyFees = getNumber("buyFees");
            const sellFees = getNumber("sellFees");
            const totalCost = (buyPrice * shares) + buyFees;
            const totalFees = buyFees + sellFees;
            const requiredProceeds = totalCost + sellFees;
            const breakEven = shares > 0 ? requiredProceeds / shares : 0;

            setOutput("breakEven", formatNumber(breakEven));
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("totalFees", formatNumber(totalFees));
            setOutput("requiredProceeds", formatNumber(requiredProceeds));
        });

        bindCalculatorForm("[data-roi-form]", "data-roi-output", ({ getNumber, setOutput }) => {
            const initial = getNumber("initial");
            const final = getNumber("final");
            const income = getNumber("income");
            const fees = getNumber("fees");
            const totalReturn = final + income - fees;
            const gain = totalReturn - initial;
            const roi = initial > 0 ? (gain / initial) * 100 : 0;

            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("totalReturn", formatNumber(totalReturn));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-total-return-form]", "data-total-return-output", ({ getNumber, setOutput }) => {
            const initial = getNumber("initial");
            const ending = getNumber("ending");
            const income = getNumber("income");
            const fees = getNumber("fees");
            const netEnding = ending + income - fees;
            const gain = netEnding - initial;
            const returnPct = initial > 0 ? (gain / initial) * 100 : 0;

            setOutput("returnPct", `${formatNumber(returnPct)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("netEnding", formatNumber(netEnding));
            setOutput("income", formatNumber(income));
        });

        bindCalculatorForm("[data-cagr-form]", "data-cagr-output", ({ getNumber, setOutput }) => {
            const beginning = getNumber("beginning");
            const ending = getNumber("ending");
            const years = getNumber("years");
            const gain = ending - beginning;
            const totalReturn = beginning > 0 ? (gain / beginning) * 100 : 0;
            const cagr = beginning > 0 && ending > 0 && years > 0
                ? ((ending / beginning) ** (1 / years) - 1) * 100
                : 0;

            setOutput("cagr", `${formatNumber(cagr)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("totalReturn", `${formatNumber(totalReturn)}%`);
            setOutput("years", formatNumber(years));
        });

        bindCalculatorForm("[data-capital-gains-form]", "data-capital-gains-output", ({ getNumber, setOutput }) => {
            const saleValue = getNumber("saleValue");
            const purchaseValue = getNumber("purchaseValue");
            const fees = getNumber("fees");
            const otherCosts = getNumber("otherCosts");
            const costs = fees + otherCosts;
            const costBasis = purchaseValue + costs;
            const gain = saleValue - costBasis;

            setOutput("gain", formatNumber(gain));
            setOutput("costBasis", formatNumber(costBasis));
            setOutput("saleValue", formatNumber(saleValue));
            setOutput("costs", formatNumber(costs));
        });

        bindCalculatorForm("[data-after-tax-form]", "data-after-tax-output", ({ getNumber, setOutput }) => {
            const profit = getNumber("profit");
            const investment = getNumber("investment");
            const taxRate = getNumber("taxRate");
            const fees = getNumber("fees");
            const taxableProfit = Math.max(profit, 0);
            const tax = taxableProfit * (taxRate / 100);
            const afterTaxProfit = profit - tax - fees;
            const returnPct = investment > 0 ? (afterTaxProfit / investment) * 100 : 0;

            setOutput("returnPct", `${formatNumber(returnPct)}%`);
            setOutput("afterTaxProfit", formatNumber(afterTaxProfit));
            setOutput("tax", formatNumber(tax));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-brokerage-form]", "data-brokerage-output", ({ getNumber, setOutput }) => {
            const buyTurnover = getNumber("buyTurnover");
            const sellTurnover = getNumber("sellTurnover");
            const brokerage = getNumber("brokerage");
            const exchangeCharges = getNumber("exchangeCharges");
            const taxes = getNumber("taxes");
            const otherCharges = getNumber("otherCharges");
            const totalTurnover = buyTurnover + sellTurnover;
            const totalCharges = brokerage + exchangeCharges + taxes + otherCharges;
            const chargeRate = totalTurnover > 0 ? (totalCharges / totalTurnover) * 100 : 0;
            const netProceeds = sellTurnover - totalCharges;

            setOutput("totalCharges", formatNumber(totalCharges));
            setOutput("totalTurnover", formatNumber(totalTurnover));
            setOutput("chargeRate", `${formatNumber(chargeRate)}%`);
            setOutput("netProceeds", formatNumber(netProceeds));
        });

        bindCalculatorForm("[data-intraday-form]", "data-intraday-output", ({ getNumber, setOutput }) => {
            const buyPrice = getNumber("buyPrice");
            const sellPrice = getNumber("sellPrice");
            const quantity = getNumber("quantity");
            const charges = getNumber("charges");
            const marginUsed = getNumber("marginUsed");
            const grossProfit = (sellPrice - buyPrice) * quantity;
            const netProfit = grossProfit - charges;
            const roi = marginUsed > 0 ? (netProfit / marginUsed) * 100 : 0;
            const turnover = (buyPrice + sellPrice) * quantity;

            setOutput("netProfit", formatNumber(netProfit));
            setOutput("grossProfit", formatNumber(grossProfit));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("turnover", formatNumber(turnover));
        });

        bindCalculatorForm("[data-delivery-form]", "data-delivery-output", ({ getNumber, setOutput }) => {
            const buyPrice = getNumber("buyPrice");
            const sellPrice = getNumber("sellPrice");
            const quantity = getNumber("quantity");
            const charges = getNumber("charges");
            const days = getNumber("days");
            const totalCost = buyPrice * quantity;
            const netProfit = ((sellPrice - buyPrice) * quantity) - charges;
            const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
            const annualized = days > 0 ? roi * (365 / days) : 0;

            setOutput("netProfit", formatNumber(netProfit));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("annualized", `${formatNumber(annualized)}%`);
        });

        bindCalculatorForm("[data-spread-form]", "data-spread-output", ({ getNumber, setOutput }) => {
            const bid = getNumber("bid");
            const ask = getNumber("ask");
            const quantity = getNumber("quantity");
            const spread = Math.max(ask - bid, 0);
            const mid = (ask + bid) / 2;
            const spreadCost = spread * quantity;
            const spreadPct = mid > 0 ? (spread / mid) * 100 : 0;

            setOutput("spreadCost", formatNumber(spreadCost));
            setOutput("spread", formatNumber(spread));
            setOutput("mid", formatNumber(mid));
            setOutput("spreadPct", `${formatNumber(spreadPct)}%`);
        });
    };

    const initializeFormulaCalculators = () => {
        const forms = [...document.querySelectorAll(selectors.formulaCalculator)];

        forms.forEach((form) => {
            const outputs = [...document.querySelectorAll(`[data-formula-scope="${form.dataset.formulaCalculator}"] [data-formula-output]`)];

            const getValues = () => {
                const values = {};
                [...form.elements].forEach((field) => {
                    if (!field.name) {
                        return;
                    }

                    const value = Number.parseFloat(field.value || "0");
                    values[field.name] = Number.isFinite(value) ? value : 0;
                });
                return values;
            };

            const calculateExpression = (expression, values) => {
                const names = Object.keys(values);
                const args = names.map((name) => values[name]);
                const fn = new Function("Math", ...names, `"use strict"; return (${expression});`);
                const result = fn(Math, ...args);
                return Number.isFinite(result) ? result : 0;
            };

            const formatFormulaValue = (value, format) => {
                if (format === "percent") {
                    return `${formatNumber(value)}%`;
                }

                if (format === "integer") {
                    return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                }

                return formatNumber(value);
            };

            const calculate = () => {
                const values = getValues();

                outputs.forEach((output) => {
                    const expression = output.dataset.formulaOutput;
                    const format = output.dataset.formulaFormat || "number";
                    const value = calculateExpression(expression, values);
                    output.textContent = formatFormulaValue(value, format);
                });
            };

            form.addEventListener("submit", (event) => {
                event.preventDefault();
                calculate();
            });
            bindResetToDefaults(form, calculate);

            calculate();
        });
    };

    const initializeCalculatorTabs = () => {
        const tabs = [...document.querySelectorAll(selectors.calculatorTab)];
        const panels = [...document.querySelectorAll(selectors.calculatorPanel)];
        const cards = [...document.querySelectorAll(selectors.calculatorCard)];

        if (!tabs.length || !panels.length) {
            return;
        }

        const setActiveCategory = (category) => {
            tabs.forEach((tab) => {
                const isActive = tab.dataset.calculatorTab === category;
                tab.classList.toggle(stateClasses.active, isActive);
                tab.setAttribute("aria-selected", String(isActive));
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.calculatorPanel === category;
                panel.classList.toggle(stateClasses.active, isActive);
                panel.hidden = !isActive;
            });

            cards.forEach((card) => {
                const isActive = card.dataset.calculatorCard === category;
                card.classList.toggle(stateClasses.highlighted, isActive);
                card.hidden = !isActive;
            });
        };

        const params = new URLSearchParams(window.location.search);
        const requestedCategory = params.get("category") || window.location.hash.replace("#", "");
        const hasRequestedCategory = tabs.some((tab) => tab.dataset.calculatorTab === requestedCategory);

        if (hasRequestedCategory) {
            setActiveCategory(requestedCategory);
        }

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const category = tab.dataset.calculatorTab;
                setActiveCategory(category);

                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set("category", category);
                window.history.replaceState({}, "", nextUrl);
            });
        });
    };

    const initializeApp = () => {
        setFooterYear();
        setHeaderScrollState();
        initializeCalculatorTabs();
        initializeCalculatorLibraryLinks();
        initializeGenericCalculatorPage();
        initializeStockProfitCalculator();
        initializeStockBatchCalculators();
        initializeFormulaCalculators();
        window.addEventListener("scroll", setHeaderScrollState, { passive: true });
    };

    initializeApp();
})();
