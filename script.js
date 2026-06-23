// ============================================================================
// Pure calculation helpers
// Kept at module top level so they can be unit tested in Node and reused in the browser.
// ============================================================================

function formatNumber(value, options = {}) {
    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    });

    return formatter.format(Number.isFinite(value) ? value : 0);
}

function computeStockProfit({ buyPrice = 0, sellPrice = 0, shares = 0, brokerage = 0, tradeType = "delivery", exchange = "nse" } = {}) {
    const buyTurnover = buyPrice * shares;
    const sellTurnover = sellPrice * shares;
    const totalTurnover = buyTurnover + sellTurnover;

    // Equity transaction charge rates differ by exchange
    const equityExchangeRate = exchange === "bse" ? 0.0000375 : 0.0000297;

    let stt = 0;
    let stampDuty = 0;
    let exchangeCharges = 0;

    if (tradeType === "delivery") {
        stt = (buyTurnover * 0.001) + (sellTurnover * 0.001);
        stampDuty = buyTurnover * 0.00015;
        exchangeCharges = totalTurnover * equityExchangeRate;
    } else if (tradeType === "intraday") {
        stt = sellTurnover * 0.00025;
        stampDuty = buyTurnover * 0.00003;
        exchangeCharges = totalTurnover * equityExchangeRate;
    } else if (tradeType === "futures") {
        stt = sellTurnover * 0.0005; // 0.05% on sell side
        stampDuty = buyTurnover * 0.00002; // 0.002% on buy side
        exchangeCharges = totalTurnover * 0.0000173; // ~0.00173% for futures
    } else if (tradeType === "options") {
        stt = sellTurnover * 0.0015; // 0.15% on sell side premium
        stampDuty = buyTurnover * 0.00003; // 0.003% on buy side premium
        exchangeCharges = totalTurnover * 0.0003503; // ~0.03503% for options premium
    }

    // STT is rounded to the nearest rupee as levied in India
    stt = Math.round(stt);

    const sebiFees = totalTurnover * 0.000001;
    const gst = (brokerage + exchangeCharges + sebiFees) * 0.18;

    const totalCharges = brokerage + stt + exchangeCharges + sebiFees + stampDuty + gst;

    const profitLoss = sellTurnover - buyTurnover - totalCharges;
    const totalCost = buyTurnover + totalCharges;
    const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
    const breakEven = shares > 0 ? (buyTurnover + totalCharges) / shares : 0;

    return {
        buyTurnover,
        sellTurnover,
        totalTurnover,
        brokerage,
        stt,
        exchangeCharges,
        sebiFees,
        stampDuty,
        gst,
        totalCharges,
        profitLoss,
        totalCost,
        roi,
        breakEven,
    };
}

function computeStockAverage({ shares1 = 0, price1 = 0, shares2 = 0, price2 = 0, shares3 = 0, price3 = 0, fees = 0 } = {}) {
    const lots = [
        { shares: shares1, price: price1 },
        { shares: shares2, price: price2 },
        { shares: shares3, price: price3 },
    ];
    const totalShares = lots.reduce((sum, lot) => sum + lot.shares, 0);
    const grossCost = lots.reduce((sum, lot) => sum + (lot.shares * lot.price), 0);
    const totalCost = grossCost + fees;
    const averagePrice = totalShares > 0 ? totalCost / totalShares : 0;

    return { averagePrice, totalShares, totalCost, fees };
}

function computeStockBreakeven({ buyPrice = 0, shares = 0, buyFees = 0, sellFees = 0 } = {}) {
    const totalCost = (buyPrice * shares) + buyFees;
    const totalFees = buyFees + sellFees;
    const requiredProceeds = totalCost + sellFees;
    const breakEven = shares > 0 ? requiredProceeds / shares : 0;

    return { breakEven, totalCost, totalFees, requiredProceeds };
}

function computeRoi({ initial = 0, final = 0, income = 0, fees = 0 } = {}) {
    const totalReturn = final + income - fees;
    const gain = totalReturn - initial;
    const roi = initial > 0 ? (gain / initial) * 100 : 0;

    return { roi, gain, totalReturn, fees };
}

function computeTotalReturn({ initial = 0, ending = 0, income = 0, fees = 0 } = {}) {
    const netEnding = ending + income - fees;
    const gain = netEnding - initial;
    const returnPct = initial > 0 ? (gain / initial) * 100 : 0;

    return { returnPct, gain, netEnding, income };
}

function computeCagr({ beginning = 0, ending = 0, years = 0 } = {}) {
    const gain = ending - beginning;
    const totalReturn = beginning > 0 ? (gain / beginning) * 100 : 0;
    const cagr = beginning > 0 && ending > 0 && years > 0
        ? ((ending / beginning) ** (1 / years) - 1) * 100
        : 0;

    return { cagr, gain, totalReturn, years };
}

function computeCapitalGains({ saleValue = 0, purchaseValue = 0, fees = 0, otherCosts = 0 } = {}) {
    const costs = fees + otherCosts;
    const costBasis = purchaseValue + costs;
    const gain = saleValue - costBasis;

    return { gain, costBasis, saleValue, costs };
}

function computeAfterTax({ profit = 0, investment = 0, taxRate = 0, fees = 0 } = {}) {
    const taxableProfit = Math.max(profit, 0);
    const tax = taxableProfit * (taxRate / 100);
    const afterTaxProfit = profit - tax - fees;
    const returnPct = investment > 0 ? (afterTaxProfit / investment) * 100 : 0;

    return { returnPct, afterTaxProfit, tax, fees };
}

function computeBrokerageCharges({ buyTurnover = 0, sellTurnover = 0, brokerage = 0, exchangeCharges = 0, taxes = 0, otherCharges = 0 } = {}) {
    const totalTurnover = buyTurnover + sellTurnover;
    const totalCharges = brokerage + exchangeCharges + taxes + otherCharges;
    const chargeRate = totalTurnover > 0 ? (totalCharges / totalTurnover) * 100 : 0;
    const netProceeds = sellTurnover - totalCharges;

    return { totalCharges, totalTurnover, chargeRate, netProceeds };
}

function computeIntradayTrade({ buyPrice = 0, sellPrice = 0, quantity = 0, charges = 0, marginUsed = 0 } = {}) {
    const grossProfit = (sellPrice - buyPrice) * quantity;
    const netProfit = grossProfit - charges;
    const roi = marginUsed > 0 ? (netProfit / marginUsed) * 100 : 0;
    const turnover = (buyPrice + sellPrice) * quantity;

    return { netProfit, grossProfit, roi, turnover };
}

function computeDeliveryTrade({ buyPrice = 0, sellPrice = 0, quantity = 0, charges = 0, days = 0 } = {}) {
    const totalCost = buyPrice * quantity;
    const netProfit = ((sellPrice - buyPrice) * quantity) - charges;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const annualized = days > 0 ? roi * (365 / days) : 0;

    return { netProfit, roi, totalCost, annualized };
}

function computeBidAskSpread({ bid = 0, ask = 0, quantity = 0 } = {}) {
    const spread = Math.max(ask - bid, 0);
    const mid = (ask + bid) / 2;
    const spreadCost = spread * quantity;
    const spreadPct = mid > 0 ? (spread / mid) * 100 : 0;

    return { spreadCost, spread, mid, spreadPct };
}

// Generic expression engine that powers the data-driven formula calculators.
function evaluateFormula(expression, values = {}) {
    const names = Object.keys(values);
    const args = names.map((name) => values[name]);
    const fn = new Function("Math", ...names, `"use strict"; return (${expression});`);
    const result = fn(Math, ...args);
    return Number.isFinite(result) ? result : 0;
}

function formatFormulaValue(value, format) {
    if (format === "percent") {
        return `${formatNumber(value)}%`;
    }

    if (format === "integer") {
        return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    return formatNumber(value);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        formatNumber,
        computeStockProfit,
        computeStockAverage,
        computeStockBreakeven,
        computeRoi,
        computeTotalReturn,
        computeCagr,
        computeCapitalGains,
        computeAfterTax,
        computeBrokerageCharges,
        computeIntradayTrade,
        computeDeliveryTrade,
        computeBidAskSpread,
        evaluateFormula,
        formatFormulaValue,
    };
}

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

    const normalizeHomeUrl = () => {
        if (window.location.pathname.endsWith("/index.html")) {
            window.history.replaceState({}, "", `${window.location.origin}/${window.location.search}${window.location.hash}`);
        }
    };

    const setHeaderScrollState = () => {
        const header = document.querySelector(selectors.header);

        if (!header) {
            return;
        }

        header.classList.toggle(stateClasses.headerScrolled, window.scrollY > 8);
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
            const brokerage = getNumber("brokerage");
            const tradeType = form.elements["tradeType"]?.value || "delivery";
            const exchange = form.elements["exchange"]?.value || "nse";

            const {
                buyTurnover,
                sellTurnover,
                stt,
                exchangeCharges,
                sebiFees,
                stampDuty,
                gst,
                totalCharges,
                profitLoss,
                totalCost,
                roi,
                breakEven,
            } = computeStockProfit({ buyPrice, sellPrice, shares, brokerage, tradeType, exchange });

            setOutput("profitLoss", formatNumber(profitLoss));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("investment", formatNumber(buyTurnover));
            setOutput("saleValue", formatNumber(sellTurnover));
            setOutput("breakEven", formatNumber(breakEven));
            setOutput("chartCost", formatNumber(totalCost));
            setOutput("chartProceeds", formatNumber(sellTurnover));
            updateChartBars(totalCost, sellTurnover);

            setOutput("brkBreakdown", formatNumber(brokerage));
            setOutput("stt", formatNumber(stt));
            setOutput("exchange", formatNumber(exchangeCharges));
            setOutput("exchangeLabel", exchange.toUpperCase());
            setOutput("sebi", formatNumber(sebiFees));
            setOutput("stamp", formatNumber(stampDuty));
            setOutput("gst", formatNumber(gst));
            setOutput("totalCharges", formatNumber(totalCharges));
        };

        // Listen for real-time changes on the dropdowns
        if (form.elements["tradeType"]) {
            form.elements["tradeType"].addEventListener("change", calculate);
        }
        if (form.elements["exchange"]) {
            form.elements["exchange"].addEventListener("change", calculate);
        }

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
            const { averagePrice, totalShares, totalCost, fees } = computeStockAverage({
                shares1: getNumber("shares1"),
                price1: getNumber("price1"),
                shares2: getNumber("shares2"),
                price2: getNumber("price2"),
                shares3: getNumber("shares3"),
                price3: getNumber("price3"),
                fees: getNumber("fees"),
            });

            setOutput("averagePrice", formatNumber(averagePrice));
            setOutput("totalShares", formatNumber(totalShares, { maximumFractionDigits: 0, minimumFractionDigits: 0 }));
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-stock-breakeven-form]", "data-stock-breakeven-output", ({ getNumber, setOutput }) => {
            const { breakEven, totalCost, totalFees, requiredProceeds } = computeStockBreakeven({
                buyPrice: getNumber("buyPrice"),
                shares: getNumber("shares"),
                buyFees: getNumber("buyFees"),
                sellFees: getNumber("sellFees"),
            });

            setOutput("breakEven", formatNumber(breakEven));
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("totalFees", formatNumber(totalFees));
            setOutput("requiredProceeds", formatNumber(requiredProceeds));
        });

        bindCalculatorForm("[data-roi-form]", "data-roi-output", ({ getNumber, setOutput }) => {
            const { roi, gain, totalReturn, fees } = computeRoi({
                initial: getNumber("initial"),
                final: getNumber("final"),
                income: getNumber("income"),
                fees: getNumber("fees"),
            });

            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("totalReturn", formatNumber(totalReturn));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-total-return-form]", "data-total-return-output", ({ getNumber, setOutput }) => {
            const { returnPct, gain, netEnding, income } = computeTotalReturn({
                initial: getNumber("initial"),
                ending: getNumber("ending"),
                income: getNumber("income"),
                fees: getNumber("fees"),
            });

            setOutput("returnPct", `${formatNumber(returnPct)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("netEnding", formatNumber(netEnding));
            setOutput("income", formatNumber(income));
        });

        bindCalculatorForm("[data-cagr-form]", "data-cagr-output", ({ getNumber, setOutput }) => {
            const { cagr, gain, totalReturn, years } = computeCagr({
                beginning: getNumber("beginning"),
                ending: getNumber("ending"),
                years: getNumber("years"),
            });

            setOutput("cagr", `${formatNumber(cagr)}%`);
            setOutput("gain", formatNumber(gain));
            setOutput("totalReturn", `${formatNumber(totalReturn)}%`);
            setOutput("years", formatNumber(years));
        });

        bindCalculatorForm("[data-capital-gains-form]", "data-capital-gains-output", ({ getNumber, setOutput }) => {
            const { gain, costBasis, saleValue, costs } = computeCapitalGains({
                saleValue: getNumber("saleValue"),
                purchaseValue: getNumber("purchaseValue"),
                fees: getNumber("fees"),
                otherCosts: getNumber("otherCosts"),
            });

            setOutput("gain", formatNumber(gain));
            setOutput("costBasis", formatNumber(costBasis));
            setOutput("saleValue", formatNumber(saleValue));
            setOutput("costs", formatNumber(costs));
        });

        bindCalculatorForm("[data-after-tax-form]", "data-after-tax-output", ({ getNumber, setOutput }) => {
            const { returnPct, afterTaxProfit, tax, fees } = computeAfterTax({
                profit: getNumber("profit"),
                investment: getNumber("investment"),
                taxRate: getNumber("taxRate"),
                fees: getNumber("fees"),
            });

            setOutput("returnPct", `${formatNumber(returnPct)}%`);
            setOutput("afterTaxProfit", formatNumber(afterTaxProfit));
            setOutput("tax", formatNumber(tax));
            setOutput("fees", formatNumber(fees));
        });

        bindCalculatorForm("[data-brokerage-form]", "data-brokerage-output", ({ getNumber, setOutput }) => {
            const { totalCharges, totalTurnover, chargeRate, netProceeds } = computeBrokerageCharges({
                buyTurnover: getNumber("buyTurnover"),
                sellTurnover: getNumber("sellTurnover"),
                brokerage: getNumber("brokerage"),
                exchangeCharges: getNumber("exchangeCharges"),
                taxes: getNumber("taxes"),
                otherCharges: getNumber("otherCharges"),
            });

            setOutput("totalCharges", formatNumber(totalCharges));
            setOutput("totalTurnover", formatNumber(totalTurnover));
            setOutput("chargeRate", `${formatNumber(chargeRate)}%`);
            setOutput("netProceeds", formatNumber(netProceeds));
        });

        bindCalculatorForm("[data-intraday-form]", "data-intraday-output", ({ getNumber, setOutput }) => {
            const { netProfit, grossProfit, roi, turnover } = computeIntradayTrade({
                buyPrice: getNumber("buyPrice"),
                sellPrice: getNumber("sellPrice"),
                quantity: getNumber("quantity"),
                charges: getNumber("charges"),
                marginUsed: getNumber("marginUsed"),
            });

            setOutput("netProfit", formatNumber(netProfit));
            setOutput("grossProfit", formatNumber(grossProfit));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("turnover", formatNumber(turnover));
        });

        bindCalculatorForm("[data-delivery-form]", "data-delivery-output", ({ getNumber, setOutput }) => {
            const { netProfit, roi, totalCost, annualized } = computeDeliveryTrade({
                buyPrice: getNumber("buyPrice"),
                sellPrice: getNumber("sellPrice"),
                quantity: getNumber("quantity"),
                charges: getNumber("charges"),
                days: getNumber("days"),
            });

            setOutput("netProfit", formatNumber(netProfit));
            setOutput("roi", `${formatNumber(roi)}%`);
            setOutput("totalCost", formatNumber(totalCost));
            setOutput("annualized", `${formatNumber(annualized)}%`);
        });

        bindCalculatorForm("[data-spread-form]", "data-spread-output", ({ getNumber, setOutput }) => {
            const { spreadCost, spread, mid, spreadPct } = computeBidAskSpread({
                bid: getNumber("bid"),
                ask: getNumber("ask"),
                quantity: getNumber("quantity"),
            });

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

            const calculate = () => {
                const values = getValues();

                outputs.forEach((output) => {
                    const expression = output.dataset.formulaOutput;
                    const format = output.dataset.formulaFormat || "number";
                    const value = evaluateFormula(expression, values);
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
            document.documentElement.dataset.calculatorCategory = category;

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
        const hashCategoryMap = {
            "stocks-calculators": "stocks",
            "mutual-funds-calculators": "mutual-funds",
            "etfs-calculators": "etfs",
        };
        const hashValue = window.location.hash.replace("#", "");
        const requestedCategory = params.get("category") || hashCategoryMap[hashValue] || hashValue;
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
        normalizeHomeUrl();
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

    if (typeof document !== "undefined") {
        initializeApp();
    }
})();
