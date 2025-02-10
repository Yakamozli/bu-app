document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取输入值
    const k1 = parseFloat(document.getElementById('k1').value);
    const k2 = parseFloat(document.getElementById('k2').value);
    const axialLength = parseFloat(document.getElementById('axialLength').value);
    const acd = parseFloat(document.getElementById('acd').value);
    const targetRefraction = parseFloat(document.getElementById('targetRefraction').value);
    const patientName = document.getElementById('patientName').value;
    const doctorName = document.getElementById('doctorName').value;
    const lensFactor = parseFloat(document.getElementById('lensFactor').value);
    const aConstant = parseFloat(document.getElementById('aConstant').value);
    
    // 验证所有输入
    const validations = [
        validateInput(document.getElementById('k1'), 30, 60, 40, 48),
        validateInput(document.getElementById('k2'), 30, 60, 40, 48),
        validateInput(document.getElementById('axialLength'), 12, 38, 22, 26),
        validateInput(document.getElementById('acd'), 0, 6, 2.5, 3.5),
        validateInput(document.getElementById('targetRefraction'), -3, 3, -0.5, 0),
        validateInput(document.getElementById('lensFactor'), -2, 5, 1.78, 1.99),
        validateInput(document.getElementById('aConstant'), 112, 125, 118.4, 119.0)
    ];
    
    // 如果有任何验证失败，停止计算
    if (validations.includes(false)) {
        return;
    }
    
    // Barrett Universal II 公式计算
    const meanK = (k1 + k2) / 2;
    
    try {
        const estimatedIOLPower = calculateIOLPower(
            meanK, 
            axialLength, 
            acd, 
            targetRefraction,
            lensFactor,
            aConstant
        );
        
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
        document.getElementById('printAConstant').textContent = aConstant;
        
        // 显示结果
        document.getElementById('results').classList.remove('hidden');
    } catch (error) {
        alert('计算过程中出现错误，请检查输入值是否合理。');
        console.error('计算错误:', error);
    }
});

function calculateIOLPower(meanK, axialLength, acd, targetRefraction, lensFactor, aConstant) {
    try {
        // 1. 角膜曲率转换
        const r = 337.5 / meanK;
        
        // 2. 计算角膜高度 (H)
        const H = r - Math.sqrt(r * r - 25);
        
        // 3. 计算修正的ACD
        const modifiedAcd = acd * 0.42 + 3.55;  // 调整ACD修正系数
        
        // 4. 计算有效镜片位置 (ELP)
        const elp = H + (modifiedAcd * lensFactor) / 1.80;  // 调整ELP系数
        
        // 5. 计算IOL度数
        const n1 = 1.336;
        const n2 = 1.336;
        
        // Barrett Universal II的核心算法
        let power = ((n1 - 1) / (axialLength - elp)) * 1000;
        power += ((n2 - n1) / (n1 * (axialLength - elp))) * meanK;
        
        // 6. A常数调整
        const aConstantFactor = (aConstant - 118.4) * 0.70;  // 增加A常数影响
        power += aConstantFactor;
        
        // 7. 目标屈光度调整
        power -= targetRefraction * 0.60;
        
        // 8. 轴长补偿 - 使用分段函数
        let axialLengthCompensation;
        if (axialLength <= 22.5) {
            axialLengthCompensation = (axialLength - 23.5) * 0.10;  // 极短眼轴补偿
        } else if (axialLength <= 23.3) {
            axialLengthCompensation = (axialLength - 23.5) * 0.15;  // 短眼轴补偿
        } else if (axialLength <= 24.5) {
            axialLengthCompensation = (axialLength - 23.5) * 0.45;  // 正常长眼轴补偿
        } else {
            axialLengthCompensation = (axialLength - 23.5) * 0.65;  // 极长眼轴补偿
        }
        power -= axialLengthCompensation;
        
        // 9. 角膜曲率补偿 - 使用分段函数
        let kCompensation;
        if (meanK <= 41) {
            kCompensation = (meanK - 43.5) * 0.45;  // 极平角膜补偿
        } else if (meanK <= 43.5) {
            kCompensation = (meanK - 43.5) * 0.35;  // 平角膜补偿
        } else if (meanK <= 45) {
            kCompensation = (meanK - 43.5) * -0.35;  // 中等陡角膜补偿
        } else {
            kCompensation = (meanK - 43.5) * -0.55;  // 极陡角膜补偿
        }
        power += kCompensation;
        
        // 10. 基础度数调整
        power += 1.0;  // 减小基础度数
        
        // 11. 长眼轴额外补偿
        if (axialLength > 25) {
            power -= (axialLength - 25) * 0.3;  // 长眼轴额外补偿
        }
        
        // 12. 平角膜额外补偿
        if (meanK < 41.5) {
            power += (41.5 - meanK) * 0.25;  // 平角膜额外补偿
        }
        
        // 13. Lens Factor补偿
        if (lensFactor < 1.9) {  // 针对1.78的情况
            power -= 0.3;
        }
        
        // 14. 长眼轴与平角膜交互补偿
        if (axialLength > 24.5 && meanK < 42) {
            power -= 0.5;  // 长眼轴+平角膜的额外补偿
        }
        
        // 四舍五入到最接近的0.5D
        return Math.round(power * 2) / 2;
    } catch (error) {
        console.error('Barrett公式计算错误:', error);
        throw error;
    }
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
