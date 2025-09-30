document.addEventListener('DOMContentLoaded', () => {
            const app = {
                suppliers: [
                    { id: 1, name: 'Espaço & Buffet', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                    { id: 2, name: 'Decoração e Flores', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                    { id: 3, name: 'Fotografia & Vídeo', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                    { id: 4, name: 'Música (DJ/Banda)', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                    { id: 5, name: 'Trajes (Noiva e Noivo)', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                    { id: 6, name: 'Convites e Papelaria', totalValue: 0, downPayment: 0, installments: 1, payments: [], paymentsVisible: false },
                ],
                
                init() {
                    this.renderSuppliers();
                    this.updateSummary();
                    this.attachEventListeners();
                    this.setupDarkModeToggle();
                    this.setupTitleEditor();
                    this.setupSidebar();
                },

                formatCurrency(value) {
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                },

                updateSummary() {
                    const totalBudget = this.suppliers.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
                    const totalPaid = this.suppliers.reduce((sum, s) => {
                        const paidInstallments = s.payments.filter(p => p.paid).reduce((paymentSum, p) => paymentSum + p.amount, 0);
                        const downPayment = Number(s.downPayment || 0);
                        return sum + downPayment + paidInstallments;
                    }, 0);
                    const totalRemaining = totalBudget - totalPaid;

                    document.getElementById('total-budget').textContent = this.formatCurrency(totalBudget);
                    document.getElementById('total-paid').textContent = this.formatCurrency(totalPaid);
                    document.getElementById('total-remaining').textContent = this.formatCurrency(totalRemaining);
                    document.getElementById('grand-total-remaining').textContent = this.formatCurrency(totalRemaining);
                },

                renderSuppliers() {
                    const container = document.getElementById('suppliers-list');
                    container.innerHTML = '';
                    this.suppliers.forEach(supplier => {
                        const paidInstallments = supplier.payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
                        const remainingBalance = (supplier.totalValue || 0) - (supplier.downPayment || 0) - paidInstallments;

                        const paymentsToggleHTML = supplier.payments.length > 0 ? `
                            <div class="toggle-payments-btn flex justify-between items-center mt-6 cursor-pointer p-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">
                                <h4 class="font-semibold text-gray-600 dark:text-gray-300">Parcelas</h4>
                                <span class="text-gray-600 dark:text-gray-300 font-bold text-xl transition-transform transform ${supplier.paymentsVisible ? 'rotate-180' : ''}">▼</span>
                            </div>
                        ` : '';

                        const supplierCard = `
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-shadow hover:shadow-2xl" data-id="${supplier.id}">
                                <div class="flex justify-between items-center mb-4">
                                    <input type="text" class="text-xl font-bold text-gray-700 dark:text-gray-200 bg-transparent border-b-2 border-transparent focus:border-blue-300 dark:focus:border-blue-500 outline-none w-full" value="${supplier.name}">
                                    <button class="delete-supplier-btn text-red-400 hover:text-red-600 font-bold text-2xl">&times;</button>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total (R$)</label>
                                        <input type="number" class="total-value-input mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="25000" value="${supplier.totalValue > 0 ? supplier.totalValue : ''}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Entrada (R$)</label>
                                        <input type="number" class="down-payment-input mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="5000" value="${supplier.downPayment > 0 ? supplier.downPayment : ''}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Nº de Parcelas Restantes</label>
                                        <input type="number" class="installments-input mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="5" value="${supplier.installments > 0 ? supplier.installments : ''}" min="1">
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center h-full flex flex-col justify-center">
                                        <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Falta Pagar</label>
                                        <p class="supplier-remaining-balance text-2xl font-bold text-[#FF6F61]">${this.formatCurrency(remainingBalance)}</p>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <button class="generate-installments-btn w-full bg-[#06D6A0] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md h-10">Gerar Parcelas</button>
                                </div>
                                ${paymentsToggleHTML}
                                <div class="payments-container mt-2 space-y-3 ${supplier.paymentsVisible ? '' : 'hidden'}">
                                    ${this.renderPayments(supplier)}
                                </div>
                            </div>
                        `;
                        container.insertAdjacentHTML('beforeend', supplierCard);
                    });
                },
                
                renderPayments(supplier) {
                    if (supplier.payments.length === 0) return '';
                    return supplier.payments.map((payment, index) => `
                        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div class="flex items-center">
                                <input type="checkbox" id="payment-${supplier.id}-${index}" class="custom-checkbox hidden" data-payment-index="${index}" ${payment.paid ? 'checked' : ''}>
                                <label for="payment-${supplier.id}-${index}" class="checkbox-label flex items-center cursor-pointer">
                                    <div></div>
                                    <span class="ml-3 text-gray-700 dark:text-gray-300">Parcela ${index + 1}</span>
                                </label>
                            </div>
                            <span class="font-semibold text-gray-800 dark:text-gray-200">${this.formatCurrency(payment.amount)}</span>
                        </div>
                    `).join('');
                },
                
                attachEventListeners() {
                    const suppliersList = document.getElementById('suppliers-list');
                    
                    suppliersList.addEventListener('click', (e) => {
                        const card = e.target.closest('[data-id]');
                        if (!card) return;
                        const supplierId = parseInt(card.dataset.id);

                        if (e.target.classList.contains('generate-installments-btn')) {
                            this.generateInstallments(supplierId);
                        }
                        if (e.target.classList.contains('delete-supplier-btn')) {
                            this.deleteSupplier(supplierId);
                        }
                        if (e.target.classList.contains('custom-checkbox')) {
                             this.togglePayment(supplierId, parseInt(e.target.dataset.paymentIndex));
                        }
                        if (e.target.closest('.toggle-payments-btn')) {
                            this.togglePaymentsVisibility(supplierId);
                        }
                    });

                    suppliersList.addEventListener('change', (e) => {
                        const card = e.target.closest('[data-id]');
                        if (!card) return;
                        const supplierId = parseInt(card.dataset.id);
                        const supplier = this.suppliers.find(s => s.id === supplierId);

                        if (e.target.classList.contains('total-value-input')) {
                            supplier.totalValue = parseFloat(e.target.value) || 0;
                            this.renderSuppliers();
                        }
                        if (e.target.classList.contains('down-payment-input')) {
                            supplier.downPayment = parseFloat(e.target.value) || 0;
                            this.renderSuppliers();
                        }
                        if (e.target.classList.contains('installments-input')) {
                            supplier.installments = parseInt(e.target.value) || 1;
                        }
                         this.updateSummary();
                    });

                    suppliersList.addEventListener('input', (e) => {
                        const card = e.target.closest('[data-id]');
                        if (!card) return;
                        const supplierId = parseInt(card.dataset.id);
                        const supplier = this.suppliers.find(s => s.id === supplierId);
                        if (e.target.type === 'text') {
                             supplier.name = e.target.value;
                        }
                    });

                    document.getElementById('add-supplier-btn').addEventListener('click', () => {
                        this.addSupplier();
                    });
                },

                setupSidebar() {
                    const hamburgerBtn = document.getElementById('hamburger-btn');
                    const sidebarMenu = document.getElementById('sidebar-menu');
                    const sidebarOverlay = document.getElementById('sidebar-overlay');

                    const toggleSidebar = () => {
                        sidebarMenu.classList.toggle('-translate-x-full');
                        sidebarOverlay.classList.toggle('hidden');
                    };

                    hamburgerBtn.addEventListener('click', toggleSidebar);
                    sidebarOverlay.addEventListener('click', toggleSidebar);
                },

                setupTitleEditor() {
                    const titleInput = document.getElementById('wedding-title');
                    const fontFamilySelect = document.getElementById('font-family-select');
                    const fontSizeSlider = document.getElementById('font-size-slider');

                    const applyTitleStyles = () => {
                        const fontFamily = fontFamilySelect.value;
                        const fontSize = fontSizeSlider.value;
                        titleInput.style.fontFamily = `'${fontFamily}', sans-serif`;
                        titleInput.style.fontSize = `${fontSize}rem`;
                        titleInput.style.lineHeight = '1.2';
                    };

                    fontFamilySelect.addEventListener('change', applyTitleStyles);
                    fontSizeSlider.addEventListener('input', applyTitleStyles);

                    applyTitleStyles();
                },

                setupDarkModeToggle() {
                    const toggleBtn = document.getElementById('dark-mode-toggle');
                    const iconContainer = document.getElementById('dark-mode-icon');
                    
                    const updateIcon = () => {
                        if (document.documentElement.classList.contains('dark')) {
                            iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`; // Sun
                        } else {
                            iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`; // Moon
                        }
                    };

                    toggleBtn.addEventListener('click', () => {
                        document.documentElement.classList.toggle('dark');
                        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                        updateIcon();
                    });

                    updateIcon();
                },

                generateInstallments(supplierId) {
                    const supplier = this.suppliers.find(s => s.id === supplierId);
                    const totalValue = supplier.totalValue || 0;
                    const downPayment = supplier.downPayment || 0;
                    const installments = supplier.installments || 0;

                    if (!supplier || totalValue <= 0 || installments <= 0) {
                        console.error('Por favor, insira um valor total e um número de parcelas válidos.');
                        return;
                    }
                     if (downPayment >= totalValue) {
                        console.error('O valor da entrada não pode ser igual ou maior que o valor total.');
                        supplier.payments = [];
                        this.renderSuppliers();
                        this.updateSummary();
                        return;
                    }
                    
                    supplier.payments = [];
                    const remainingBalance = totalValue - downPayment;
                    const installmentAmount = remainingBalance / installments;
                    for (let i = 0; i < installments; i++) {
                        supplier.payments.push({ amount: installmentAmount, paid: false });
                    }
                    supplier.paymentsVisible = true;
                    this.renderSuppliers();
                    this.updateSummary();
                },
                
                togglePayment(supplierId, paymentIndex) {
                    const supplier = this.suppliers.find(s => s.id === supplierId);
                    supplier.payments[paymentIndex].paid = !supplier.payments[paymentIndex].paid;
                    this.updateSummary();
                    this.renderSuppliers();
                },

                togglePaymentsVisibility(supplierId) {
                    const supplier = this.suppliers.find(s => s.id === supplierId);
                    if (supplier) {
                        supplier.paymentsVisible = !supplier.paymentsVisible;
                        this.renderSuppliers();
                    }
                },

                addSupplier() {
                    const newId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => s.id)) + 1 : 1;
                    this.suppliers.push({
                        id: newId,
                        name: 'Novo Fornecedor (editável)',
                        totalValue: 0,
                        downPayment: 0,
                        installments: 1,
                        payments: [],
                        paymentsVisible: false
                    });
                    this.renderSuppliers();
                    this.updateSummary();
                },
                
                deleteSupplier(supplierId) {
                    this.suppliers = this.suppliers.filter(s => s.id !== supplierId);
                    this.renderSuppliers();
                    this.updateSummary();
                }
            };
            
            app.init();
        });