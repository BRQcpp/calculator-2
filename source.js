let numberInput = document.querySelector('#number-input');
let decimalNumbers = 1000;
let selectionStart = null;
let operationDone = false;

document.getElementById('dn-input').addEventListener('change', () =>
{
    const inputValue = document.getElementById('dn-input').value;
    if(inputValue > decimalNumbers.toString().length-1)
        decimalNumbers *= 10;
    else    
        decimalNumbers /= 10;
});

numberInput.addEventListener('blur', () =>
{
    numberInput.focus();    
});

numberInput.addEventListener('input', () =>
{
    if(document.querySelector('.number-io').querySelector('.alert'))
        removeAlert(document.querySelector('.number-io'), document.querySelector('#number-input')); 
    index = numberInput.selectionStart-1;
    let equation = numberInput.value;
    let char = equation.slice(index, index+1);
    equation = equation.slice(0, index) + equation.slice(index+1, equation.length);
    validateInput(char, equation, index)
});

document.querySelector('.clear-history').addEventListener('click', () =>
{
    if(document.querySelector('.calc-history').querySelector('.calc-history-content'))
    {
        clearAndRemoveResultsChildren();

        const parent = document.querySelector('.calc-history');
    
        let banner = document.createElement('div');
        banner.classList.add('github-banner');
    
        let bannerImg = document.createElement('img');
        bannerImg.classList.add('gh-img');
        bannerImg.setAttribute('alt', 'github-logo');
        bannerImg.setAttribute('id', 'top-banner');
        bannerImg.setAttribute('src', './graphics/github-icon.png');
    
        let bannerSpan = document.createElement('span');
        bannerSpan.textContent = 'BRQcpp';
    
        banner.appendChild(bannerImg);
        banner.appendChild(bannerSpan);
    
        parent.appendChild(banner);
    }
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



function validateInput(char, equation, index, vk = false, recursive = false)
{
    let move = 1;
    if(char == '*')
        char = '×';
    else if(char == '/')
        char = '÷';
    else if(char == ',')
        char = '.';
    else if(char == 'x²')
        char = '²';

    let override = true;

    switch(char)
    {
        case 'C' :
        {
            equation = '';
        } break;

        case '⮨' : 
        {
            char = equation.slice(index, index+1);
            equation = equation.slice(0, index-1) + equation.slice(index+1, equation.length);
            index = validateInput(char, equation, index-1, false, true);
            equation = numberInput.value;
            override = false;
        } break;

        case '√':; case '²':; case '.':; case '%':
        {
            let lastChar = equation.charAt(index-1);
            if(lastChar == char)
                break;
            if(char == '²')
            {
                if((isNaN(lastChar) || index == 0) && lastChar != '.' && lastChar != ')')
                {
                        if(!recursive)
                            generateAlert('Pick a number first', document.querySelector('.number-io'), document.querySelector('#number-input'));
                        break;  
                }
            }
            else if(char == '√')
            {
                if(((lastChar != '÷' && lastChar != '+' && lastChar != '×' && lastChar != '×' && lastChar != '-') && equation.length != 0) && index != 0)
                {
                    if(!recursive)
                        generateAlert('Do not put root after non operation', document.querySelector('.number-io'), document.querySelector('#number-input'));
                    break;  
                }
            }
            else if(char == '%')
            {
                if(equation.length == 0 || (isNaN(lastChar) && lastChar != '²'))
                {
                    if(!recursive)
                        generateAlert('Do not put % after non numbers', document.querySelector('.number-io'), document.querySelector('#number-input'));
                    break;
                }
            }


            equation = equation.slice(0, index) + char + equation.slice(index, equation.length);
            
        } break;

        case '-' : 
        {
            if(equation.charAt(index-1) == '.' &&  (equation.charAt(index-2) == '+' || equation.charAt(index-2) == '-' || equation.charAt(index-2) == '×'|| equation.charAt(index-2) == '÷'))
            {
                if(!recursive)
                    generateAlert('No operations before decimals', document.querySelector('.number-io'), document.querySelector('#number-input'));
                break;
            }
            let lastChar = equation.charAt(index);
            if(lastChar == '÷' || lastChar == '+' || lastChar == '×')
                break;
            let indexes = moveToLastOperation(equation, index);
            index = indexes.index;
            let moveBack = indexes.lastIndex != index;
            let i = 0;
            if(equation.charAt(index-1) == '-')
            {
                i++;
                while(equation.charAt(index-i) == '-')
                {
                    i++;
                    continue;
                }
            }
            if(moveBack == true)
                index = indexes.lastIndex;
            if(i == 4)
                break;
            else if(i > 4)
                equation = equation.slice(0, index-1) + char + equation.slice(index+1, equation.length);
            else
                equation = equation.slice(0, index) + char + equation.slice(index, equation.length);

        } break;

        case '+' :; case '÷':; case '×':; 
        {
            if(index == 0)
            {
                if(!recursive)
                    generateAlert('Pick a number first', document.querySelector('.number-io'), document.querySelector('#number-input'));
                break;  
            }
            if(equation.charAt(index-1) == '.' &&  (equation.charAt(index-2) == '+' || equation.charAt(index-2) == '-' || equation.charAt(index-2) == '×'|| equation.charAt(index-2) == '÷'))
            {
                if(!recursive)
                    generateAlert('No operations before decimals', document.querySelector('.number-io'), document.querySelector('#number-input'));
                break;
            }


            let indexes = moveToLastOperation(equation, index);
            index = indexes.index;
            let moveBack = indexes.lastIndex != index;
            lastChar = equation.charAt(index-1);

            if(lastChar == '√') 
                break;

            if(lastChar == '÷' || lastChar == '+' || lastChar == '-' || lastChar == '×' || lastChar == '√') 
            {
                if(lastChar == '-')
                {
                    let i = 1;
                    while(equation.charAt(index-i-1) == '-')
                    {
                        i++;
                        continue;
                    }
                    if(equation.length == i)
                    {
                        if(!recursive)
                            generateAlert('Pick a number first', document.querySelector('.number-io'), document.querySelector('#number-input'));
                        break;  
                    }
                    equation = equation.slice(0, index-i) + char + equation.slice(index, equation.length);
                    index -= i;
                    lastChar = equation.charAt(index-1);
                    if(lastChar == '÷' || lastChar == '+' || lastChar == '×')
                        move--;
                    if(lastChar == '÷' || lastChar == '+' || lastChar == '-' || lastChar == '×'|| lastChar == '√')
                        equation = equation.slice(0, index-1) + char + equation.slice(index+1, equation.length);
                    if(i == 1 && equation.charAt(index-1) != '÷' && equation.charAt(index-1) != '×' && equation.charAt(index-1) != '+')
                        index++;
                }
                else 
                    equation = equation.slice(0, index-1) + char + equation.slice(index, equation.length);
            }
            else
                equation = equation.slice(0, index) + char + equation.slice(index, equation.length);
            if(moveBack == true)
                index = indexes.lastIndex;
        } break;

        case '1' :; case '2':; case '3':; case '4':; case '5':; case '6':; case '7':;  case '8':;  case '9':;  case '0':;  case '(':;  case ')':
        {
            equation = equation.slice(0, index) + char + equation.slice(index, equation.length);
        }
    }
    let moveBack = false;
    if(numberInput.value.length == equation.length)
        move--;
    else 
        moveBack = true;
    let selectionRange = numberInput.selectionStart;

    if(override == true)
        numberInput.value = equation;

    if(vk == true)
        numberInput.setSelectionRange(index+move, index+move);
    else if(moveBack == true)
        numberInput.setSelectionRange(index, index);
    if(recursive)
        return index;
}


function moveToLastOperation(equation, index)
{
    let lastIndex = index;

    if(equation.charAt(index) == '÷' ||  equation.charAt(index) == '+' || equation.charAt(index) == '×') 
    {
        index++;
        moveBack = true;
    }
    else if(equation.charAt(index) == '-' )
    {
        while(equation.charAt(index) == '-')
            index++;
    }
    return { index, lastIndex };
}


function addToInput(key)
{   
    if(document.querySelector('.number-io').querySelector('.alert'))
        removeAlert(document.querySelector('.number-io'), document.querySelector('#number-input')); 
    let index = numberInput.selectionStart;
    validateInput(key, numberInput.value, index, true);
}


function resolveMainCalculation(inputValue)
{
    equation = inputValue;
    let equationCalculate = splitEquations(inputValue);
    let result = resolveCalculation(equationCalculate);

    if(!isNaN(result))
    {
        if(result != equation && operationDone)
        {
            numberInput.value = result;
            saveResult(inputValue, result);
            operationDone = false;
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
        {
            result = Math.round((resolve(separatedEquasion.numbers, separatedEquasion.operations) + Number.EPSILON) * decimalNumbers) / decimalNumbers;
            operationDone = true;
        }
            
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
                if(first != i && equation.charAt(i-1) != '√')
                {
                    numbers.push(isCorrectNumber(equation.slice(first, i)));
                    if(isNaN(numbers[numbers.length-1]))
                        return NaN;
                    first = i+1;
                }
                if(equation.charAt(i) == '-' &&equation.charAt(i+1) == '-')
                {
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
        let decimals = 0;
        for(let i = 0; i < number.length; i++)
        {
            if(number.charAt(i) == '.')
                decimals++;
            if(decimals == 2)
            {
                number = number.slice(0, i) + number.slice(i+1, number.length);
                decimals--;
                i--;
            }
        }
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
            operationDone = true;
        }
        if(number.charAt(number.length-1) == '²')
        {
            number = number.slice(0, number.length-1);
            power = true;
            operationDone = true;
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
            operationDone = true;
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
    const parent = document.querySelector('.calc-history');

    if(parent.querySelector('.github-banner'))
        parent.removeChild(parent.querySelector('.github-banner'));

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

    parent.appendChild(content);

    resultContentChildrenW += content.getBoundingClientRect().height + 5;

    if(resultContentChildrenW > parent.getBoundingClientRect().height)
    {
        parent.style.setProperty('padding-right', '0');
    }

    let resultHistoryEquasions = document.querySelectorAll('.calc-history-content-lr');
    fillInputEL(calc);
    fillInputEL(res);
    parent.scrollTop = parent.scrollHeight;
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