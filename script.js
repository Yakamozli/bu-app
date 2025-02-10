document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 验证所有输入
    const validations = [
        validateInput(document.getElementById('k1'), 30, 60, 40, 48),
        validateInput(document.getElementById('k2'), 30, 60, 40, 48),
        validateInput(document.getElementById('axialLength'), 12, 38, 22, 26),
        validateInput(document.getElementById('acd'), 0, 6, 2.5, 3.5),
        validateInput(document.getElementById('targetRefraction'), -3, 3, -0.5, 0),
        validateInput(document.getElementById('lensFactor'), 1.5, 2.5, 1.78, 1.99),
        validateInput(document.getElementById('aConstant'), 110, 120, 118.4, 119.0)
    ];
    
    // 验证Lens Factor是否已选择
    const lensFactor = document.getElementById('lensFactor').value;
    if (!lensFactor) {
        alert('请选择Lens Factor值');
        return;
    }
    
    // 如果有任何验证失败，停止计算
    if (validations.includes(false)) {
        return;
    }
    
    // 获取输入值
    const k1 = parseFloat(document.getElementById('k1').value);
    const k2 = parseFloat(document.getElementById('k2').value);
    const axialLength = parseFloat(document.getElementById('axialLength').value);
    const acd = parseFloat(document.getElementById('acd').value);
    const targetRefraction = parseFloat(document.getElementById('targetRefraction').value);
    const patientName = document.getElementById('patientName').value;
    const doctorName = document.getElementById('doctorName').value;
    
    // Barrett Universal II 公式计算
    // 注意：这里只是一个简化版本的示例计算
    // 实际的Barrett Universal II 公式更复杂，需要更多参数和步骤
    const meanK = (k1 + k2) / 2;
    const estimatedIOLPower = calculateIOLPower(meanK, axialLength, acd, targetRefraction);
    
    // 更新打印结果显示
    document.getElementById('printPatientName').textContent = patientName;
    document.getElementById('printDoctorName').textContent = doctorName;
    document.getElementById('printDate').textContent = new Date().toLocaleString();
    document.getElementById('printK1').textContent = k1.toFixed(2) + " D";
    document.getElementById('printK2').textContent = k2.toFixed(2) + " D";
    document.getElementById('printAxialLength').textContent = axialLength.toFixed(2) + " mm";
    document.getElementById('printAcd').textContent = acd.toFixed(2) + " mm";
    document.getElementById('printTargetRefraction').textContent = targetRefraction.toFixed(2) + " D";
    document.getElementById('printLensFactor').textContent = lensFactor;
    document.getElementById('iolPower').textContent = estimatedIOLPower.toFixed(2) + " D";
    document.getElementById('predictedRefraction').textContent = targetRefraction.toFixed(2) + " D";
    document.getElementById('printAConstant').textContent = document.getElementById('aConstant').value;
    
    // 显示结果
    document.getElementById('results').classList.remove('hidden');
});

function calculateIOLPower(meanK, axialLength, acd, targetRefraction) {
    // 这里需要实现完整的Barrett Universal II 公式
    // 以下只是一个简化的示例计算
    let iolPower = 23.50 - (axialLength - 23.50) * 2.5 + (meanK - 43.50) * 0.9;
    iolPower = iolPower - targetRefraction;
    return iolPower;
}

// 打印功能
document.getElementById('printButton').addEventListener('click', function() {
    window.print();
});

// 保存功能
document.getElementById('saveButton').addEventListener('click', function() {
    const currentData = {
        date: new Date().toLocaleString(),
        patientName: document.getElementById('patientName').value,
        doctorName: document.getElementById('doctorName').value,
        k1: document.getElementById('k1').value,
        k2: document.getElementById('k2').value,
        axialLength: document.getElementById('axialLength').value,
        acd: document.getElementById('acd').value,
        targetRefraction: document.getElementById('targetRefraction').value,
        lensFactor: document.getElementById('lensFactor').value,
        iolPower: document.getElementById('iolPower').textContent,
        predictedRefraction: document.getElementById('predictedRefraction').textContent,
        aConstant: document.getElementById('aConstant').value
    };
    
    // 从localStorage获取已保存的记录
    let savedRecords = JSON.parse(localStorage.getItem('iolCalculations') || '[]');
    
    // 添加新记录
    savedRecords.unshift(currentData);
    
    // 最多保存500条记录
    if (savedRecords.length > 500) {
        savedRecords = savedRecords.slice(0, 500);
    }
    
    // 保存到localStorage
    localStorage.setItem('iolCalculations', JSON.stringify(savedRecords));
    
    // 显示保存的记录
    displaySavedRecords();
    
    alert('数据已保存！');
});

// 删除记录
function deleteRecord(index) {
    let savedRecords = JSON.parse(localStorage.getItem('iolCalculations') || '[]');
    savedRecords.splice(index, 1);
    localStorage.setItem('iolCalculations', JSON.stringify(savedRecords));
    displaySavedRecords();
}

// 修改显示记录的函数
function displaySavedRecords() {
    const savedRecords = JSON.parse(localStorage.getItem('iolCalculations') || '[]');
    const recordsList = document.getElementById('recordsList');
    const savedRecordsDiv = document.getElementById('savedRecords');
    
    if (savedRecords.length === 0) {
        savedRecordsDiv.classList.add('hidden');
        return;
    }
    
    savedRecordsDiv.classList.remove('hidden');
    recordsList.innerHTML = '';
    
    savedRecords.forEach((record, index) => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record-item';
        recordDiv.innerHTML = `
            <div class="record-header">
                <p><strong>日期：</strong>${record.date}</p>
                <button class="delete-button" onclick="deleteRecord(${index})">删除</button>
            </div>
            <p><strong>患者姓名：</strong>${record.patientName}</p>
            <p><strong>医生姓名：</strong>${record.doctorName}</p>
            <p><strong>K1：</strong>${record.k1} | <strong>K2：</strong>${record.k2}</p>
            <p><strong>眼轴长度：</strong>${record.axialLength}mm</p>
            <p><strong>前房深度：</strong>${record.acd}mm</p>
            <p><strong>目标屈光度：</strong>${record.targetRefraction}</p>
            <p><strong>Lens Factor：</strong>${record.lensFactor}</p>
            <p><strong>建议IOL度数：</strong>${record.iolPower}</p>
            <p><strong>预期术后屈光度：</strong>${record.predictedRefraction}</p>
            <p><strong>A Constant：</strong>${record.aConstant}</p>
        `;
        recordsList.appendChild(recordDiv);
    });
}

// 页面加载时显示保存的记录
window.addEventListener('load', displaySavedRecords);

// 添加输入验证函数
function validateInput(input, min, max, normalMin, normalMax) {
    const value = parseFloat(input.value);
    const errorDiv = input.parentElement.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message';
    
    if (isNaN(value)) {
        errorDiv.textContent = '请输入有效数值';
        errorDiv.classList.add('show');
        input.parentElement.appendChild(errorDiv);
        return false;
    }
    
    if (value < min || value > max) {
        errorDiv.textContent = `数值必须在 ${min} 到 ${max} 之间`;
        errorDiv.classList.add('show');
        input.parentElement.appendChild(errorDiv);
        return false;
    }
    
    if (value < normalMin || value > normalMax) {
        errorDiv.textContent = `警告：数值超出正常范围 (${normalMin}-${normalMax})`;
        errorDiv.classList.add('show');
        input.parentElement.appendChild(errorDiv);
        return true; // 允许继续，但显示警告
    }
    
    errorDiv.classList.remove('show');
    return true;
}

// 添加实时输入验证
const inputs = ['k1', 'k2', 'axialLength', 'acd', 'targetRefraction', 'lensFactor', 'aConstant'];
const validationRanges = {
    'k1': [30, 60, 40, 48],
    'k2': [30, 60, 40, 48],
    'axialLength': [12, 38, 22, 26],
    'acd': [0, 6, 2.5, 3.5],
    'targetRefraction': [-3, 3, -0.5, 0],
    'lensFactor': [-2, 5, 1.78, 1.99],
    'aConstant': [112, 125, 118.4, 119.0]
};

inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    input.addEventListener('input', function() {
        const [min, max, normalMin, normalMax] = validationRanges[inputId];
        validateInput(this, min, max, normalMin, normalMax);
    });
}); 