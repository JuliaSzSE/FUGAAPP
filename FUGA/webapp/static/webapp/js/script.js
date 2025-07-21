let devices = [];
let variables = [];
let currentDevice = null;

document.addEventListener('DOMContentLoaded', function() {
    loadDevicesFromStorage();
    loadVariablesFromStorage();
    updateProgress();
    updateDeviceList();
});

function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function updateProgress() {
    const form = document.getElementById('deviceForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let filledInputs = 0;

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            filledInputs++;
        }
    });

    const progress = (filledInputs / inputs.length) * 100;
    document.querySelector('.progress-fill').style.width = progress + '%';
}

document.getElementById('deviceForm').addEventListener('input', updateProgress);
document.getElementById('deviceForm').addEventListener('change', updateProgress);

function saveDevice() {
    const form = document.getElementById('deviceForm');
    const formData = new FormData(form);
    const device = {};

    for (let [key, value] of formData.entries()) {
        device[key] = value;
    }

    device.created_at = new Date().toISOString();
    device.id = Date.now().toString();

    devices.push(device);
    saveDevicesToStorage();
    updateDeviceList();
    showAlert('Device saved successfully!', 'success');
    resetForm();
}

function resetForm() {
    document.getElementById('deviceForm').reset();
    updateProgress();
}

function loadCSV() {
    const file = document.getElementById('csvFile').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');

        if (lines.length > 1) {
            const data = lines[1].split(',');
            const form = document.getElementById('deviceForm');

            headers.forEach((header, index) => {
                const input = form.querySelector(`[name="${header.trim()}"]`);
                if (input && data[index]) {
                    input.value = data[index].trim();
                }
            });

            updateProgress();
            showAlert('CSV loaded successfully!', 'success');
        }
    };
    reader.readAsText(file);
}

function generateCSV() {
    if (devices.length === 0) {
        showAlert('No devices to export!', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const headers = ['device_name', 'device_type', 'tag_prefix', 'io_device', 'device_ip', 'port_name', 'unit_number', 'protocol'];
        let csv = headers.join(',') + '\n';

        devices.forEach(device => {
            const row = headers.map(header => device[header] || '').join(',');
            csv += row + '\n';
        });

        downloadCSV(csv, 'device_configuration.csv');

        if (variables.length > 0) {
            const varHeaders = ['variable_name', 'variable_type', 'data_type', 'unit'];
            let varCsv = varHeaders.join(',') + '\n';

            variables.forEach(variable => {
                const row = varHeaders.map(header => variable[header] || '').join(',');
                varCsv += row + '\n';
            });

            downloadCSV(varCsv, 'variable_configuration.csv');
        }

        hideLoading();
        showAlert('CSV files generated successfully!', 'success');
    }, 2000);
}

function addVariable() {
    const name = document.getElementById('variable_name').value;
    const type = document.getElementById('variable_type').value;
    const dataType = document.getElementById('data_type').value;
    const unit = document.getElementById('unit').value;

    if (!name) {
        showAlert('Please enter a variable name!', 'error');
        return;
    }

    const variable = {
        id: Date.now().toString(),
        variable_name: name,
        variable_type: type,
        data_type: dataType,
        unit: unit
    };

    variables.push(variable);
    saveVariablesToStorage();
    updateVariableTable();
    clearVariableForm();
    showAlert('Variable added successfully!', 'success');
}

function removeVariable(id) {
    variables = variables.filter(v => v.id !== id);
    saveVariablesToStorage();
    updateVariableTable();
    showAlert('Variable removed successfully!', 'success');
}

function clearVariableForm() {
    document.getElementById('variable_name').value = '';
    document.getElementById('variable_type').value = 'analog';
    document.getElementById('data_type').value = 'float';
    document.getElementById('unit').value = '';
}

function updateVariableTable() {
    const tbody = document.getElementById('variableTableBody');
    tbody.innerHTML = '';

    variables.forEach(variable => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${variable.variable_name}</td>
            <td>${variable.variable_type}</td>
            <td>${variable.data_type}</td>
            <td>${variable.unit || '-'}</td>
            <td>
                <button class="btn btn-secondary" onclick="removeVariable('${variable.id}')">🗑️ Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateDeviceList() {
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = '';

    if (devices.length === 0) {
        deviceList.innerHTML = '<div class="placeholder-content"><p>No devices configured yet. Go to Configuration tab to add devices.</p></div>';
        return;
    }

    devices.forEach(device => {
        const deviceItem = document.createElement('div');
        deviceItem.className = 'device-item';
        deviceItem.innerHTML = `
            <div class="device-header">
                <span class="device-name">${device.device_name}</span>
                <span class="device-type">${device.device_type}</span>
            </div>
            <div class="device-details">
                <div class="device-detail"><strong>IP:</strong> ${device.device_ip}</div>
                <div class="device-detail"><strong>Protocol:</strong> ${device.protocol}</div>
                <div class="device-detail"><strong>Unit:</strong> ${device.unit_number}</div>
                <div class="device-detail"><strong>Tag Prefix:</strong> ${device.tag_prefix}</div>
            </div>
        `;
        deviceList.appendChild(deviceItem);
    });
}

// Placeholder: can be expanded to use localStorage or indexedDB
function saveDevicesToStorage() {}
function loadDevicesFromStorage() {}
function saveVariablesToStorage() {}
function loadVariablesFromStorage() {}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const container = document.querySelector('.tab-content.active');
    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// IP address validation
document.getElementById('device_ip').addEventListener('blur', function () {
    const ip = this.value;
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (ip && !ipPattern.test(ip)) {
        showAlert('Please enter a valid IP address!', 'error');
        this.focus();
    }
});
