 // DOM Elements
        const orderModal = document.getElementById('orderModal');
        const statusModal = document.getElementById('statusModal');
        const exportImportModal = document.getElementById('exportImportModal');
        const ordersTableBody = document.getElementById('ordersTableBody');
        const noOrdersMessage = document.getElementById('noOrdersMessage');
        const orderForm = document.getElementById('orderForm');
        const searchInput = document.getElementById('searchInput');
        const filterPanel = document.getElementById('filterPanel');
        const importFile = document.getElementById('importFile');
        const fileName = document.getElementById('fileName');
        
        // Order data structure
        let orders = [];
        
        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            loadOrders();
            setupEventListeners();
        });
        
        // Set up event listeners
        function setupEventListeners() {
            // Form submission
            orderForm.addEventListener('submit', saveOrder);
            
            // Search functionality
            searchInput.addEventListener('input', filterOrders);
            
            // Import file selection
            importFile.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    fileName.textContent = e.target.files[0].name;
                }
            });

            // Mask inputs
            const phoneInput = document.getElementById('customerPhone');
            const cpfCnpjInput = document.getElementById('customerCpfCnpj');
            
            phoneInput.addEventListener('input', () => applyPhoneMask(phoneInput));
            cpfCnpjInput.addEventListener('input', () => applyCpfCnpjMask(cpfCnpjInput));
        }
        
        // Load orders from localStorage
        function loadOrders() {
            showLoading(true);
            
            // Simulate loading delay (for demo purposes)
            setTimeout(() => {
                const storedOrders = localStorage.getItem('serviceOrders');
                orders = storedOrders ? JSON.parse(storedOrders) : [];
                
                // Calculate dashboard stats
                updateDashboardStats();
                
                // Render orders
                renderOrders(orders);
                
                showLoading(false);
            }, 500);
        }
        
        // Save orders to localStorage
        function saveOrders() {
            localStorage.setItem('serviceOrders', JSON.stringify(orders));
            updateDashboardStats();
        }
        
        // Render orders to the table
        function renderOrders(ordersToRender) {
            if (ordersToRender.length === 0) {
                ordersTableBody.innerHTML = '';
                noOrdersMessage.classList.remove('hidden');
                return;
            }
            
            noOrdersMessage.classList.add('hidden');
            
            // Sort by date (newest first)
            const sortedOrders = [...ordersToRender].sort((a, b) => 
                new Date(b.entryDate) - new Date(a.entryDate)
            );
            
            let html = '';
            sortedOrders.forEach(order => {
                // Format dates
                const entryDate = new Date(order.entryDate).toLocaleString();
                const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '--';
                
                // Get status badge class
                let statusClass = '';
                switch(order.status) {
                    case 'Em andamento': statusClass = 'status-em-andamento'; break;
                    case 'Finalizado': statusClass = 'status-finalizado'; break;
                    case 'Entregue': statusClass = 'status-entregue'; break;
                    case 'Cancelado': statusClass = 'status-cancelado'; break;
                }
                
                html += `
                    <tr class="hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-700 font-medium">#${order.id}</td>
                        <td class="py-3 px-4">
                            <div class="text-sm text-gray-900">${order.customerName}</div>
                            <div class="text-sm text-gray-500">${order.customerPhone}</div>
                        </td>
                        <td class="py-3 px-4">
                            <div class="text-sm text-gray-900">${order.vehicleBrand} ${order.vehicleModel}</div>
                            <div class="text-sm text-gray-500">${order.vehicleYear} - ${order.vehiclePlate}</div>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-500">${entryDate}</td>
                        <td class="py-3 px-4 text-sm text-gray-500">${order.mechanic || '--'}</td>
                        <td class="py-3 px-4">
                            <div class="text-sm text-gray-900">R$ ${parseFloat(order.totalValue || 0).toFixed(2)}</div>
                            <div class="text-xs text-gray-500">Pago: R$ ${parseFloat(order.amountReceived || 0).toFixed(2)}</div>
                        </td>
                        <td class="py-3 px-4">
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex space-x-1">
                                <button onclick="openStatusModal(${order.id})" class="p-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    <i class="fas fa-exchange-alt text-sm"></i>
                                </button>
                                <button onclick="editOrder(${order.id})" class="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>
                                <button onclick="deleteOrder(${order.id})" class="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 ${order.status === 'Cancelado' ? '' : 'opacity-50 cursor-not-allowed'}" ${order.status === 'Cancelado' ? '' : 'disabled'}>
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            ordersTableBody.innerHTML = html;
        }
        
        // Update dashboard statistics
        function updateDashboardStats() {
            document.getElementById('totalOrders').textContent = orders.length;
            
            const pendingOrders = orders.filter(order => 
                order.status === 'Em andamento' || order.status === 'Finalizado'
            ).length;
            document.getElementById('pendingOrders').textContent = pendingOrders;
            
            const deliveredOrders = orders.filter(order => 
                order.status === 'Entregue'
            ).length;
            document.getElementById('deliveredOrders').textContent = deliveredOrders;
            
            const totalRevenue = orders.reduce((sum, order) => 
                sum + parseFloat(order.amountReceived || 0), 0);
            document.getElementById('totalRevenue').textContent = 
                `R$ ${totalRevenue.toFixed(2)}`;
        }
        
        // Open modal for new order
        function openOrderModal() {
            document.getElementById('modalTitle').textContent = 'Nova Ordem de Serviço';
            document.getElementById('orderId').value = '';
            
            // Clear form
            orderForm.reset();
            document.getElementById('entryDate').value = new Date().toISOString().slice(0, 16);
            
            orderModal.classList.remove('hidden');
        }
        
        // Close order modal
        function closeOrderModal() {
            orderModal.classList.add('hidden');
        }
        
        // Open modal for editing an order
        function editOrder(id) {
            const order = orders.find(o => o.id === id);
            if (!order) return;
            
            document.getElementById('modalTitle').textContent = 'Editar Ordem de Serviço';
            document.getElementById('orderId').value = order.id;
            
            // Fill form with order data
            document.getElementById('customerName').value = order.customerName || '';
            document.getElementById('customerPhone').value = order.customerPhone || '';
            document.getElementById('customerCpfCnpj').value = order.cpfCnpj || '';
            document.getElementById('vehicleBrand').value = order.vehicleBrand || '';
            document.getElementById('vehicleModel').value = order.vehicleModel || '';
            document.getElementById('vehicleYear').value = order.vehicleYear || '';
            document.getElementById('vehiclePlate').value = order.vehiclePlate || '';
            document.getElementById('serviceDescription').value = order.description || '';
            
            // Add existing budget items
            const container = document.getElementById('budgetItemsContainer');
            container.innerHTML = '';
            
            if (order.items) {
                Object.entries(order.items).forEach(([description, value]) => {
                    const itemId = Date.now();
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'flex items-center space-x-2 bg-gray-50 p-2 rounded-lg';
                    itemDiv.innerHTML = `
                        <div class="flex-1">
                            <span class="text-sm font-medium">${description}</span>
                            <span class="text-sm text-gray-500 ml-2">R$ ${parseFloat(value).toFixed(2)}</span>
                        </div>
                        <button type="button" onclick="removeBudgetItem('${itemId}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-times"></i>
                        </button>
                        <input type="hidden" name="budgetItems" data-description="${description}" data-value="${value}">
                    `;
                    itemDiv.id = `item-${itemId}`;
                    container.appendChild(itemDiv);
                });
            }
            
            // Update total
            updateTotalValue();
            
            // Format dates
            const entryDate = order.entryDate ? order.entryDate.slice(0, 16) : new Date().toISOString().slice(0, 16);
            document.getElementById('entryDate').value = entryDate;
            document.getElementById('deliveryDate').value = order.deliveryDate || '';
            
            document.getElementById('mechanic').value = order.mechanic || '';
            document.getElementById('serviceStatus').value = order.status || 'Em andamento';
            document.getElementById('totalValue').value = order.totalValue || '';
            document.getElementById('amountReceived').value = order.amountReceived || '';
            document.getElementById('paymentMethod').value = order.paymentMethod || '';
            document.getElementById('finalNotes').value = order.notes || '';
            
            orderModal.classList.remove('hidden');
        }
        
        // Save order (create or update)
        function saveOrder(e) {
            e.preventDefault();
            
            // Get form data
            const id = document.getElementById('orderId').value;
            const customerName = document.getElementById('customerName').value;
            const customerPhone = document.getElementById('customerPhone').value;
            const cpfCnpj = document.getElementById('customerCpfCnpj').value;
            const vehicleBrand = document.getElementById('vehicleBrand').value;
            const vehicleModel = document.getElementById('vehicleModel').value;
            const vehicleYear = document.getElementById('vehicleYear').value;
            const vehiclePlate = document.getElementById('vehiclePlate').value;
            const description = document.getElementById('serviceDescription').value;
            
            // Get budget items
            const items = {};
            const budgetItems = document.querySelectorAll('input[name="budgetItems"]');
            budgetItems.forEach(item => {
                const description = item.dataset.description;
                const value = item.dataset.value;
                if (description && value) {
                    items[description] = value;
                }
            });
            
            const entryDate = document.getElementById('entryDate').value;
            const deliveryDate = document.getElementById('deliveryDate').value;
            const mechanic = document.getElementById('mechanic').value;
            const status = document.getElementById('serviceStatus').value;
            const totalValue = document.getElementById('totalValue').value;
            const amountReceived = document.getElementById('amountReceived').value;
            const paymentMethod = document.getElementById('paymentMethod').value;
            const notes = document.getElementById('finalNotes').value;
            
            // Create order object
            const order = {
                id: id ? parseInt(id) : generateId(),
                customerName,
                customerPhone,
                cpfCnpj,
                vehicleBrand,
                vehicleModel,
                vehicleYear,
                vehiclePlate,
                description,
                items,
                entryDate,
                deliveryDate,
                mechanic,
                status,
                totalValue,
                amountReceived,
                paymentMethod,
                notes
            };
            
            // Update or add the order
            if (id) {
                const index = orders.findIndex(o => o.id === parseInt(id));
                if (index !== -1) {
                    orders[index] = order;
                }
            } else {
                orders.push(order);
            }
            
            // Save and render
            saveOrders();
            renderOrders(orders);
            closeOrderModal();
            
            // Show success notification
            showNotification('Ordem salva com sucesso!', 'success');
        }
        
        // Generate new ID for order
        function generateId() {
            const maxId = orders.reduce((max, order) => 
                Math.max(max, order.id), 0
            );
            return maxId + 1;
        }
        
        // Delete order
        function deleteOrder(id) {
            // Only allow deletion if status is canceled
            const order = orders.find(o => o.id === id);
            if (order && order.status !== 'Cancelado') {
                showNotification('Apenas ordens canceladas podem ser excluídas', 'warning');
                return;
            }
            
            if (confirm('Tem certeza que deseja excluir esta ordem? Esta ação não pode ser desfeita.')) {
                orders = orders.filter(order => order.id !== id);
                saveOrders();
                renderOrders(orders);
                
                // Show success notification
                showNotification('Ordem excluída com sucesso!', 'success');
            }
        }
        
        // Open status change modal
        function openStatusModal(id) {
            document.getElementById('statusOrderId').value = id;
            statusModal.classList.remove('hidden');
        }
        
        // Close status modal
        function closeStatusModal() {
            statusModal.classList.add('hidden');
        }
        
        // Update order status
        function updateOrderStatus() {
            const id = document.getElementById('statusOrderId').value;
            const newStatus = document.getElementById('newStatus').value;
            
            const order = orders.find(o => o.id === parseInt(id));
            if (order) {
                order.status = newStatus;
                saveOrders();
                renderOrders(orders);
                
                // Show success notification
                showNotification('Status atualizado com sucesso!', 'success');
            }
            
            closeStatusModal();
        }
        
        // Filter orders
        function filterOrders() {
            const searchTerm = searchInput.value.toLowerCase();
            
            // Get filter values
            const statusFilter = document.getElementById('filterStatus').value;
            const startDate = document.getElementById('filterStartDate').value;
            const endDate = document.getElementById('filterEndDate').value;
            const mechanicFilter = document.getElementById('filterMechanic').value.toLowerCase();
            
            const filtered = orders.filter(order => {
                // Text search
                if (searchTerm && 
                    !order.customerName.toLowerCase().includes(searchTerm) &&
                    !order.vehiclePlate.toLowerCase().includes(searchTerm) &&
                    !order.vehicleModel.toLowerCase().includes(searchTerm) &&
                    order.id.toString() !== searchTerm) {
                    return false;
                }
                
                // Status filter
                if (statusFilter && order.status !== statusFilter) {
                    return false;
                }
                
                // Mechanic filter
                if (mechanicFilter && (!order.mechanic || !order.mechanic.toLowerCase().includes(mechanicFilter))) {
                    return false;
                }
                
                // Date range filter
                const entryDate = new Date(order.entryDate);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0,0,0,0);
                    if (entryDate < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23,59,59,999);
                    if (entryDate > end) return false;
                }
                
                return true;
            });
            
            renderOrders(filtered);
        }
        
        // Apply filters
        function applyFilters() {
            filterOrders();
        }
        
        // Toggle filter panel visibility
        function toggleFilterPanel() {
            filterPanel.classList.toggle('hidden');
        }
        
        // Open export/import modal
        function openExportImportModal() {
            exportImportModal.classList.remove('hidden');
        }
        
        // Close export/import modal
        function closeExportImportModal() {
            exportImportModal.classList.add('hidden');
        }
        
        // Export data to JSON file
        function exportData() {
            const dataStr = JSON.stringify(orders);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `ordens-servico_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showNotification('Dados exportados com sucesso!', 'success');
        }
        
        // Import data from JSON file
        function importData() {
            if (importFile.files.length === 0) {
                showNotification('Selecione um arquivo para importar', 'warning');
                return;
            }
            
            const file = importFile.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedOrders = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedOrders)) {
                        showNotification('Formato de arquivo inválido', 'danger');
                        return;
                    }
                    
                    if (confirm('Importar este arquivo substituirá todos os dados atuais. Tem certeza?')) {
                        orders = importedOrders;
                        saveOrders();
                        renderOrders(orders);
                        
                        showNotification('Dados importados com sucesso!', 'success');
                        closeExportImportModal();
                    }
                } catch (error) {
                    showNotification('Erro ao ler o arquivo: ' + error.message, 'danger');
                }
            };
            
            reader.readAsText(file);
        }
        
        // Show notification
        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-md text-white animate-fadeIn z-50`;
            
            // Set color based on type
            switch(type) {
                case 'success': 
                    notification.classList.add('bg-green-500');
                    break;
                case 'warning':
                    notification.classList.add('bg-yellow-500');
                    break;
                case 'danger':
                    notification.classList.add('bg-red-500');
                    break;
                default:
                    notification.classList.add('bg-blue-500');
            }
            
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('opacity-0');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Show/hide loading overlay
        function showLoading(show) {
            const overlay = document.getElementById('loadingOverlay');
            overlay.classList.toggle('hidden', !show);
        }

        // Budget items functions
        function addBudgetItem() {
            const description = document.getElementById('itemDescription').value;
            const value = document.getElementById('itemValue').value;
            
            if (!description || !value) {
                showNotification('Preencha descrição e valor do item', 'warning');
                return;
            }
            
            const container = document.getElementById('budgetItemsContainer');
            const itemId = Date.now();
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center space-x-2 bg-gray-50 p-2 rounded-lg mb-2';
            itemDiv.innerHTML = `
                <div class="flex-1">
                    <span class="text-sm font-medium">${description}</span>
                    <span class="text-sm text-gray-500 ml-2">R$ ${parseFloat(value).toFixed(2)}</span>
                </div>
                <button type="button" onclick="removeBudgetItem('${itemId}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
                <input type="hidden" name="budgetItems" data-description="${description}" data-value="${value}">
            `;
            itemDiv.id = `item-${itemId}`;
            
            container.appendChild(itemDiv);
            
            // Clear inputs
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemValue').value = '';
            document.getElementById('itemDescription').focus();
            
            // Update total
            updateTotalValue();
        }
        
        function removeBudgetItem(id) {
            const item = document.getElementById(`item-${id}`);
            if (item) {
                item.remove();
                updateTotalValue();
            }
        }
        
        function updateTotalValue() {
            const items = document.querySelectorAll('input[name="budgetItems"]');
            let total = 0;
            
            items.forEach(item => {
                total += parseFloat(item.dataset.value) || 0;
            });
            
            document.getElementById('totalValue').value = total.toFixed(2);
        }
        
        // Mask functions
        function applyPhoneMask(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 10) {
                // Format as (XX) XXXXX-XXXX
                value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length > 6) {
                // Format as (XX) XXXX-XXXX
                value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
            } else if (value.length > 2) {
                // Format as (XX) XXXX
                value = value.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
            } else if (value.length > 0) {
                // Format as (XX
                value = value.replace(/^(\d{0,2})$/, '($1');
            }
            input.value = value;
        }

        function applyCpfCnpjMask(input) {
            let value = input.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                // CNPJ format: XX.XXX.XXX/XXXX-XX
                value = value.substring(0, 14);
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            } else {
                // CPF format: XXX.XXX.XXX-XX
                value = value.substring(0, 11);
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
            }
            input.value = value;
        }
