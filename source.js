
let numberInput = document.querySelector('#number-input');
numberInput.value = '5-3-1';
let selectionStart = null;

numberInput.addEventListener("blur", () =>
{
    numberInput.focus();    
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
    resolveCalculation(numberInput.value);
})

function addToInput(key)
{
    switch(key)
    {
        case 'C' : numberInput.value = '';break;
        case '⮨' : 
        {
            let string = numberInput.value;
            numberInput.value = string.substr(0, numberInput.selectionStart-1) + string.substr(numberInput.selectionStart, string.length);
        };break;
        default: numberInput.value += key;
    }

}

function resolveCalculation(inputValue)
{
    let equation = splitEquations(inputValue);
    let numbers = getNumbers(equation);
    let operations = getOperations(equation);
    let result;
    if(numbers.length < 1)
        result = numbers.at(0);
    else
        result = resolve(numbers, operations)
    if(NaN != result)
        numberInput.value = result;
}

function splitEquations(equation) 
{
    let first = 0;
    let equations = [];

    for(let i = 0; i < equation.length; i++)
    {
        if(equation.charAt(i) == '(')
                first = i;

        else if(equation.charAt(i) == ')')
        {   
            let current = equation.slice(first+1, i);
            equations.push(current);
            first++;
            let numbers = getNumbers(current); 
            let operations = getOperations(current);
            let result;
            if(numbers.length < 1)
                result = numbers.at(0);
            else
                result = resolve(numbers, operations)
            equation = equation.slice(0, first-1) + result + equation.slice(first+current.length+1, equation.length);
        }
    }
    return equation;
}



function getNumbers(equation) 
{
    let numbers = [];
    let first = 0;
    let i = 0

    if(equation.charAt(0) == '-')
        i++;

    for(i; i < equation.length; i++)
    {
        if(equation.charAt(i) == '+' || equation.charAt(i) == '÷' || equation.charAt(i) == '×' || equation.charAt(i) == '-')
        {
            if(equation.charAt(i-1) != '+' && equation.charAt(i-1) != '÷' && equation.charAt(i-1) != '×' && equation.charAt(i-1) && '-')
            {
                numbers.push(equation.slice(first, i));
                first = i+1;
            }
        }
        else if(i+1 == equation.length)
            numbers.push(equation.slice(first, i+1));
    }
    console.table(numbers);
    return numbers;
}   

function getOperations(equation) 
{
    let operations = [];

    let i = 0
    if(equation.charAt(0) == '-')
        i++;

    for(i; i < equation.length; i++)
    {
        if(equation.charAt(i-1) != '+' && equation.charAt(i-1) != '÷' && equation.charAt(i-1) != '×' && equation.charAt(i-1) != '-')
        {
            if(equation.charAt(i) == '+' || equation.charAt(i) == '÷' || equation.charAt(i) == '×' || equation.charAt(i) == '-')
                operations.push(equation.slice(i, i+1));
        }
    }
    console.table(operations);
    return operations;
}

function resolve(numbers, operations) 
{
    let oplength = operations.length;
    if(numbers.length-1 == oplength)
    {
        for(let i = 0; operations.length > 0;)
        {
            if(operations.at(i) == '÷' || operations.at(i) == '×')
            {  
                if(operations.at(i) == '÷')
                    numbers[i] /= numbers.at(i+1);
                else if(operations.at(i) == '×')
                    numbers[i] *= numbers.at(i+1);

                numbers.splice(i+1, 1);
                operations.splice(i, 1);
            }
            else 
                break;
        }
        for(let i = 0; operations.length > 0;)
        {
            if(operations.at(i) == '-' || operations.at(i) == '+')
            {  
                if(operations.at(i) == '-')
                    numbers[i] -= numbers.at(i+1);
                else if(operations.at(i) == '+')
                    numbers[i] = +numbers[i] + +numbers.at(i+1);
                numbers.splice(i+1, 1);
                operations.splice(i, 1);
            }
            else 
                break;
        }
    }
    console.table(numbers);
    return numbers[0];
}