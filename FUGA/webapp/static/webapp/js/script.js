
 let selectedProtocol = 'modbus';
  let devices = [];
  let variables = [];
  let currentDevice = null;

  document.addEventListener('DOMContentLoaded', function() {

    selectProtocol('modbus');


    loadDevicesFromStorage();
    loadVariablesFromStorage();
    updateProgress();
    updateDeviceList();


    const cidFileInput = document.getElementById('cidFile');
    if (cidFileInput) {
      cidFileInput.addEventListener('change', loadCID);
    }
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


  function selectProtocol(protocol) {
    selectedProtocol = protocol;

    document.querySelectorAll('.protocol-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (event && event.target) {
      event.target.closest('.protocol-btn').classList.add('active');
    }


    const modbusConfig = document.getElementById('modbus-config');
    const iecConfig = document.getElementById('iec-config');


    const csvLabel = document.getElementById('fileInputLabel');
    const csvFile = document.getElementById('csvFile');


    const cidLabel = document.getElementById('cidInputLabel');
    const cidFile = document.getElementById('cidFile');

    if (protocol === 'modbus') {
      if (modbusConfig) modbusConfig.classList.remove('hidden');
      if (iecConfig) iecConfig.classList.add('hidden');


      if (csvLabel) csvLabel.classList.remove('hidden');
      if (csvFile) csvFile.classList.remove('hidden');


      if (cidLabel) cidLabel.classList.add('hidden');
      if (cidFile) cidFile.classList.add('hidden');

      const protocolSelect = document.getElementById('protocol');
      if (protocolSelect) {
        protocolSelect.innerHTML = '<option value="Modbus">Modbus TCP/IP</option>';
      }
    } else if (protocol === 'iec') {
      if (modbusConfig) modbusConfig.classList.add('hidden');
      if (iecConfig) iecConfig.classList.remove('hidden');


      if (csvLabel) csvLabel.classList.remove('hidden');
      if (csvFile) csvFile.classList.remove('hidden');


      if (cidLabel) cidLabel.classList.remove('hidden');
      if (cidFile) cidFile.classList.remove('hidden');

      const protocolSelect = document.getElementById('protocol');
      if (protocolSelect) {
        protocolSelect.innerHTML = '<option value="IEC61850">IEC 61850</option>';
      }
    }

    resetForm();
  }


  function loadCID() {
    const file = document.getElementById('cidFile').files[0];
    if (file) {
      console.log('Loading CID file:', file.name);
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const content = e.target.result;
          parseCIDFile(content);
        } catch (error) {
          console.error('Error parsing CID file:', error);
          showAlert('Error parsing CID file. Please check the file format.', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  function parseCIDFile(content) {

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error('Invalid XML format');
    }


    const ieds = xmlDoc.getElementsByTagName('IED');
    if (ieds.length > 0) {
      const ied = ieds[0];
      const iedName = ied.getAttribute('name');
      if (iedName) {
        const iedInput = document.getElementById('ied_name');
        if (iedInput) iedInput.value = iedName;
      }


      const accessPoints = ied.getElementsByTagName('AccessPoint');
      if (accessPoints.length > 0) {
        const ap = accessPoints[0];
        const apName = ap.getAttribute('name');
        if (apName) {
          const apInput = document.getElementById('access_point');
          if (apInput) apInput.value = apName;
        }


        const addresses = ap.getElementsByTagName('Address');
        if (addresses.length > 0) {
          const pTypes = addresses[0].getElementsByTagName('P');
          for (let i = 0; i < pTypes.length; i++) {
            if (pTypes[i].getAttribute('type') === 'IP') {
              const ipInput = document.getElementById('iec_device_ip');
              if (ipInput) ipInput.value = pTypes[i].textContent;
            }
            if (pTypes[i].getAttribute('type') === 'OSI-AP-Title') {
              const titleInput = document.getElementById('osi_ap_title');
              if (titleInput) titleInput.value = pTypes[i].textContent;
            }
            if (pTypes[i].getAttribute('type') === 'OSI-AE-Qualifier') {
              const qualifierInput = document.getElementById('osi_ae_qualifier');
              if (qualifierInput) qualifierInput.value = pTypes[i].textContent;
            }
          }
        }
      }


      const logicalDevices = ied.getElementsByTagName('LDevice');
      if (logicalDevices.length > 0) {
        const ldName = logicalDevices[0].getAttribute('inst');
        if (ldName) {
          const ldInput = document.getElementById('logical_device');
          if (ldInput) ldInput.value = ldName;
        }


        const logicalNodes = logicalDevices[0].getElementsByTagName('LN');
        const lnOptions = [];
        for (let i = 0; i < logicalNodes.length; i++) {
          const lnClass = logicalNodes[i].getAttribute('lnClass');
          const lnInst = logicalNodes[i].getAttribute('inst') || '';
          const lnPrefix = logicalNodes[i].getAttribute('prefix') || '';
          const lnName = lnPrefix + lnClass + lnInst;
          lnOptions.push(`<option value="${lnName}">${lnName}</option>`);
        }

        if (lnOptions.length > 0) {
          const lnSelect = document.getElementById('logical_node');
          if (lnSelect) {
            lnSelect.innerHTML = '<option value="">Select Logical Node</option>' + lnOptions.join('');
          }
        }
      }


      const dataSets = xmlDoc.getElementsByTagName('DataSet');
      if (dataSets.length > 0) {
        const dsOptions = [];
        for (let i = 0; i < dataSets.length; i++) {
          const dsName = dataSets[i].getAttribute('name');
          if (dsName) {
            dsOptions.push(`<option value="${dsName}">${dsName}</option>`);
          }
        }

        if (dsOptions.length > 0) {
          const dsSelect = document.getElementById('data_set');
          if (dsSelect) {
            dsSelect.innerHTML = '<option value="">Select Data Set</option>' + dsOptions.join('');
          }
        }
      }


      const reportControls = xmlDoc.getElementsByTagName('ReportControl');
      if (reportControls.length > 0) {
        const rcOptions = [];
        for (let i = 0; i < reportControls.length; i++) {
          const rcName = reportControls[i].getAttribute('name');
          if (rcName) {
            rcOptions.push(`<option value="${rcName}">${rcName}</option>`);
          }
        }

        if (rcOptions.length > 0) {
          const rcSelect = document.getElementById('report_control');
          if (rcSelect) {
            rcSelect.innerHTML = '<option value="">Select Report Control</option>' + rcOptions.join('');
          }
        }
      }
    }

    console.log('CID file parsed successfully');
    showAlert('CID file loaded successfully!', 'success');
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


  function resetForm() {
    const form = document.getElementById('deviceForm');
    if (form) {
      form.reset();
    }


    const lnSelect = document.getElementById('logical_node');
    const dsSelect = document.getElementById('data_set');
    const rcSelect = document.getElementById('report_control');

    if (lnSelect) lnSelect.innerHTML = '<option value="">Select Logical Node</option>';
    if (dsSelect) dsSelect.innerHTML = '<option value="">Select Data Set</option>';
    if (rcSelect) rcSelect.innerHTML = '<option value="">Select Report Control</option>';


    const csvFile = document.getElementById('csvFile');
    const cidFile = document.getElementById('cidFile');
    if (csvFile) csvFile.value = '';
    if (cidFile) cidFile.value = '';

    updateProgress();
  }


  function updateProgress() {
    const form = document.getElementById('deviceForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], select[required]');
    let filledInputs = 0;

    inputs.forEach(input => {
      if (input.value.trim() !== '') {
        filledInputs++;
      }
    });

    const progress = (filledInputs / inputs.length) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
  }


  const deviceForm = document.getElementById('deviceForm');
  if (deviceForm) {
    deviceForm.addEventListener('input', updateProgress);
    deviceForm.addEventListener('change', updateProgress);
  }


  function saveDevice() {
    if (!validateForm()) return;

    const form = document.getElementById('deviceForm');
    const formData = new FormData(form);
    const device = {};

    for (let [key, value] of formData.entries()) {
      device[key] = value;
    }

    device.created_at = new Date().toISOString();
    device.id = Date.now().toString();
    device.protocol_type = selectedProtocol;

    devices.push(device);
    saveDevicesToStorage();
    updateDeviceList();
    showAlert('Device saved successfully!', 'success');
    resetForm();
  }


  function validateForm() {
    if (selectedProtocol === 'modbus') {
      return validateModbusForm();
    } else if (selectedProtocol === 'iec') {
      return validateIECForm();
    }
    return false;
  }

  function validateModbusForm() {
    const deviceName = document.getElementById('device_name');
    const deviceIP = document.getElementById('modbus_device_ip') || document.getElementById('device_ip');
    const port = document.getElementById('port');
    const slaveId = document.getElementById('slave_id') || document.getElementById('unit_number');

    if (!deviceName || !deviceName.value.trim()) {
      showAlert('Please enter device name', 'error');
      return false;
    }

    if (!deviceIP || !deviceIP.value.trim()) {
      showAlert('Please enter device IP address', 'error');
      return false;
    }

    if (port && (!port.value.trim() || isNaN(port.value) || port.value < 1 || port.value > 65535)) {
      showAlert('Please enter valid port number (1-65535)', 'error');
      return false;
    }

    if (slaveId && (!slaveId.value.trim() || isNaN(slaveId.value) || slaveId.value < 1 || slaveId.value > 255)) {
      showAlert('Please enter valid slave ID (1-255)', 'error');
      return false;
    }

    return true;
  }

  function validateIECForm() {
    const deviceName = document.getElementById('device_name');
    const iedName = document.getElementById('ied_name');
    const deviceIP = document.getElementById('iec_device_ip');

    if (!deviceName || !deviceName.value.trim()) {
      showAlert('Please enter device name', 'error');
      return false;
    }

    if (!iedName || !iedName.value.trim()) {
      showAlert('Please enter IED name', 'error');
      return false;
    }

    if (!deviceIP || !deviceIP.value.trim()) {
      showAlert('Please enter device IP address', 'error');
      return false;
    }

    return true;
  }


  function addVariable() {
    const name = document.getElementById('variable_name');
    const type = document.getElementById('variable_type');
    const dataType = document.getElementById('data_type');
    const unit = document.getElementById('unit');

    if (!name || !name.value.trim()) {
      showAlert('Please enter a variable name!', 'error');
      return;
    }

    const variable = {
      id: Date.now().toString(),
      variable_name: name.value,
      variable_type: type ? type.value : 'analog',
      data_type: dataType ? dataType.value : 'float',
      unit: unit ? unit.value : ''
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
    const name = document.getElementById('variable_name');
    const type = document.getElementById('variable_type');
    const dataType = document.getElementById('data_type');
    const unit = document.getElementById('unit');

    if (name) name.value = '';
    if (type) type.value = 'analog';
    if (dataType) dataType.value = 'float';
    if (unit) unit.value = '';
  }

  function updateVariableTable() {
    const tbody = document.getElementById('variableTableBody');
    if (!tbody) return;

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
    if (!deviceList) return;

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
          <span class="device-name">${device.device_name || 'Unnamed Device'}</span>
          <span class="device-type">${device.device_type || device.protocol_type || 'Unknown'}</span>
        </div>
        <div class="device-details">
          <div class="device-detail"><strong>IP:</strong> ${device.device_ip || device.modbus_device_ip || device.iec_device_ip || 'N/A'}</div>
          <div class="device-detail"><strong>Protocol:</strong> ${device.protocol || device.protocol_type || 'Unknown'}</div>
          <div class="device-detail"><strong>Unit:</strong> ${device.unit_number || device.slave_id || 'N/A'}</div>
          <div class="device-detail"><strong>Tag Prefix:</strong> ${device.tag_prefix || 'N/A'}</div>
        </div>
      `;
      deviceList.appendChild(deviceItem);
    });
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

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  function saveDevicesToStorage() {

    console.log('Saving devices to storage:', devices);
  }

  function loadDevicesFromStorage() {

    console.log('Loading devices from storage');
  }

  function saveVariablesToStorage() {

    console.log('Saving variables to storage:', variables);
  }

  function loadVariablesFromStorage() {

    console.log('Loading variables from storage');
  }


  function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('show');
  }

  function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('show');
  }

  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const container = document.querySelector('.tab-content.active') || document.body;
    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
      alert.remove();
    }, 3000);
  }


  const deviceIPInput = document.getElementById('device_ip');
  const modbusIPInput = document.getElementById('modbus_device_ip');
  const iecIPInput = document.getElementById('iec_device_ip');

  function validateIPAddress(input) {
    if (!input) return;

    input.addEventListener('blur', function () {
      const ip = this.value;
      const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      if (ip && !ipPattern.test(ip)) {
        showAlert('Please enter a valid IP address!', 'error');
        this.focus();
      }
    });
  }


  validateIPAddress(deviceIPInput);
  validateIPAddress(modbusIPInput);
  validateIPAddress(iecIPInput);


  function submitForm() {
    if (validateForm()) {
      saveDevice();
      return true;
    }
    return false;
  }