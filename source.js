let numberInput = document.querySelector('#number-input');
let decimalNumbers = 1000;
let selectionStart = null;
let equation;

document.getElementById('dn-input').addEventListener('change', () =>
{
    const inputValue = document.getElementById('dn-input').value;
    if(inputValue > decimalNumbers.toString().length-1)
        decimalNumbers *= 10;
    else    
        decimalNumbers /= 10;
    console.log(decimalNumbers)
});

numberInput.addEventListener('blur', () =>
{
    numberInput.focus();    
});

numberInput.addEventListener('input', () =>
{
    if(document.querySelector('.number-io').querySelector('.alert'))
        removeAlert(document.querySelector('.number-io'), document.querySelector('#number-input')); 
});

document.querySelectorAll('.key').forEach((key) =>
{
    key.addEventListener('mousedown', () =>
    {
        addToInput(key.textContent);
    })
});

document.querySelector('.calculate-key').addEventListener('mousedown', () => 
{
    if(numberInput.value.length > 1)
        resolveMainCalculation(numberInput.value);
})



function addToInput(key)
{   
    if(document.querySelector('.number-io').querySelector('.alert'))
        removeAlert(document.querySelector('.number-io'), document.querySelector('#number-input')); 

    switch(key)
    {
        case 'C' :
        {
            numberInput.value = '';
            clearAndRemoveResultsChildren();
        } break;

        case '⮨' : 
        {
            let string = numberInput.value;
            let index = numberInput.selectionStart;
            numberInput.value = string.substr(0, numberInput.selectionStart-1) + string.substr(numberInput.selectionStart, string.length);
            numberInput.setSelectionRange(index-1, index-1);
        } break;

        case 'x²' :
        {
            let string = numberInput.value;
            let index = numberInput.selectionStart;
            string = string.slice(0, index) + '²' + string.slice(index, string.length);
            numberInput.value = string;
            numberInput.setSelectionRange(index+1, index+1);
        } break;

        default: 
        {
            let string = numberInput.value;
            let index = numberInput.selectionStart;
            string = string.slice(0, index) + key + string.slice(index, string.length);
            numberInput.value = string;
            numberInput.setSelectionRange(index+1, index+1);
        }
    }
}


function resolveMainCalculation(inputValue)
{
    equation = inputValue;
    let equationCalculate = splitEquations(inputValue);
    let result = resolveCalculation(equationCalculate);

    if(!isNaN(result))
    {
        if(result != equation)
        {
            numberInput.value = result;
            saveResult(inputValue, result);
        }
    }
    else
        generateAlert('Your input is wrong', document.querySelector('.number-io'), document.querySelector('#number-input'));
}


function resolveCalculation(equation)
{
    let separatedEquasion = separateEquasion(equation); 
    let result = NaN;
    if(separatedEquasion)
    {
        if(separatedEquasion.numbers.length == 1)
            result = Math.round((separatedEquasion.numbers.at(0)) * decimalNumbers) / decimalNumbers;
        else
            result = Math.round((resolve(separatedEquasion.numbers, separatedEquasion.operations) + Number.EPSILON) * decimalNumbers) / decimalNumbers;
    }
    return result;
}


function splitEquations(equation) 
{
    let first = 0;
    let equations = [];

    for(let i = 0; i < equation.length; i++)
    {
        if(equation.charAt(i) == '('    )
                first = i;

        else if(equation.charAt(i) == ')')
        {   
            let current = equation.slice(first+1, i);
            equations.push(current);
            first++;
            let result = '';
            if(current.length > 0)
                result = resolveCalculation(current);
            let oldLength = equation.length;
            equation = equation.slice(0, first-1) + result + equation.slice(first+current.length+1, equation.length);
            i -= oldLength - equation.length + 2;
        }
    }
    return equation;
}


function separateEquasion(equation) 
{
    let numbers = [];
    let operations = [];
    let first = 0;
    let i = 0

    if(equation.charAt(0) == '-')
        i++;

    for(i; i < equation.length; i++)
    {
        if(   ((equation.charAt(i-1) != '+' && equation.charAt(i-1) != '÷' && equation.charAt(i-1) != '×' && equation.charAt(i-1) != '-')
              &&  
              (equation.charAt(i) == '+' || equation.charAt(i) == '÷' || equation.charAt(i) == '×' || equation.charAt(i) == '-'))
            ||  
        (equation.charAt(i) == '+' || equation.charAt(i) == '÷' || equation.charAt(i) == '×') )
        {
            if(equation.charAt(i) == '+' || equation.charAt(i) == '÷' || equation.charAt(i) == '×' || equation.charAt(i) == '-')
            {
                if(first != i && equation.charAt(i-1) != '√') // &&  equation.charAt(i-2) != '√'
                {
                    numbers.push(isCorrectNumber(equation.slice(first, i)));
                    if(isNaN(numbers[numbers.length-1]))
                        return NaN;
                    first = i+1;
                }
                if(equation.charAt(i) == '-' &&equation.charAt(i+1) == '-')
                {
                    //equation = equation.slice(i+1, i+2)
                    operations.push('+');
                    first++;
                    i++;
                }
                else
                    operations.push(equation.slice(i, i+1));
            }
        }
        else if(i+1 == equation.length)
        {
            numbers.push(isCorrectNumber(equation.slice(first, i+1)));
            if(isNaN(numbers[numbers.length-1]))
                return NaN;
            break;
        }
    }
    if(numbers.length == 0)
        numbers[0] = equation;

    return { numbers: numbers, operations: operations };
}   

function resolve(numbers, operations) 
{
    let oplength = operations.length;
    if(numbers.length-1 == oplength)
    {   
        for(let i = 0; i < operations.length; i++)
        {
            if(operations.at(i) == '÷' || operations.at(i) == '×')
            {  
                if(operations.at(i) == '÷')
                {
                    if(numbers.at(i+1) != '0')
                        numbers[i] /= numbers.at(i+1);
                    else 
                    {
                        generateAlert('Division by 0 is undefined', document.querySelector('.number-io'), document.querySelector('#number-input'));
                        return NaN;
                    }  
                }
                else if(operations.at(i) == '×')
                    numbers[i] *= numbers.at(i+1);

                numbers.splice(i+1, 1);
                operations.splice(i, 1);
                i--;
            }
        
        }

        for(let i = 0; operations.length > 0; i++)
        {
            if(operations.at(i) == '-' || operations.at(i) == '+')
            {  
                if(operations.at(i) == '-')
                    numbers[i] -= numbers.at(i+1);
                else if(operations.at(i) == '+')
                    numbers[i] = +numbers[i] + +numbers.at(i+1);
                numbers.splice(i+1, 1);
                operations.splice(i, 1);
                i--;
            }
        }
    }   
    else 
        return NaN;
    return numbers[0];
}

function isCorrectNumber(number)
{
    let i = 0;
    if(isNaN(number))
    {
        let power = false;
        let precent = false;
        if(number.charAt(i) == '-' && number.charAt(i+1) == '-')
            number = number.slice(i+2, number.length);
        else if(number.charAt(i) == '-')
            i++;
        if(number.charAt(number.length-1) == '%')    
        {
            number = number.slice(0, number.length-1);
            precent = true;
        }
        if(number.charAt(number.length-1) == '²')
        {
            number = number.slice(0, number.length-1);
            power = true;
        }
        if(number.charAt(i) == '√')
        {
            number = number.slice(0, i) + number.slice(i+1, number.length);
            if(number.charAt(i) == '-' && number.charAt(i+1) == '-')
                number = number.slice(i+2, number.length);
            if(!isNaN(number) && number.slice(i, number.length) < 0)
            {
                generateAlert('Your input is wrong, there is no square root from negative number', document.querySelector('.number-io'), document.querySelector('#number-input'));
                return NaN;
            }
            else   
                number = number.slice(0, i) + Math.sqrt(number.slice(i, number.length))
        }
        if(power == true)
            number = Math.pow(number, 2);
        if(precent == true)
            number /= 100;
    }
    return number;
}


let resultContentChildrenW = 0;
function saveResult(calculation, result) 
{
    let content = document.createElement('div');
    content.classList.add('calc-history-content');

    let calc = document.createElement('span');
    calc.classList.add('calc-history-content-lr');
    calc.textContent = calculation;
    content.appendChild(calc);

    let equal = document.createElement('span');
    equal.classList.add('calc-history-content-equal');
    equal.textContent = '=';
    content.appendChild(equal);
    
    let res = document.createElement('span');
    res.classList.add('calc-history-content-lr');
    res.textContent = result;
    content.appendChild(res);

    const parent = document.querySelector('.calc-history');
    parent.appendChild(content);

    resultContentChildrenW += content.getBoundingClientRect().height + 5;

    if(resultContentChildrenW > parent.getBoundingClientRect().height)
    {
        parent.style.setProperty('padding-right', '0');
    }

    let resultHistoryEquasions = document.querySelectorAll('.calc-history-content-lr');
    fillInputEL(calc);
    fillInputEL(res);
}

function fillInputEL(element)
{
    element.addEventListener('click', () => 
    {
        numberInput.value = element.textContent;
    });
}

function clearAndRemoveResultsChildren() 
{
    const parent = document.querySelector('.calc-history');
    let children = parent.querySelectorAll('.calc-history-content');
    children.forEach( (child) => 
    {
        parent.removeChild(child);
    });
    parent.style.setProperty('padding-right', '8px');
    resultContentChildrenW = 0;
}

function generateAlert(text, parent, child)
{
    if(document.querySelector('.alert') == null)
    {
        let alert = document.createElement('div');
        alert.classList.add('alert');
        alert.textContent = text;
        parent.insertBefore(alert, child)
        child.style.setProperty('margin-top', '9px');
    }
}

function removeAlert(parent, child)
{
    parent.removeChild(parent.querySelector('.alert'));
    child.style.setProperty('margin-top', '49px');
}