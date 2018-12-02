import * as esprima from 'esprima';

const parseCode = (codeToParse, function_arguments) => {
    let parsedCode = esprima.parseScript(codeToParse, { loc: true });
    initialize_data(parsedCode);
    //getData();
    for(var i = 0; i < function_arguments.length; i++){
        argument_values.push(function_arguments[i]);
    }
    return parsedCode;
};

export{initialize_data};
export {parseCode};
//export{getData};
let argument_values = [];
let symbolTable = [];
let params = [];
//let isElse = false;
let math_it_up = {
    '+': function (x, y) { return x + y; },
    '-': function (x, y) { return x - y; },
    '*': function (x, y) { return x * y; },
    '/': function (x, y) { return x / y; }
};

/*let functions = [];
let params = [];
let local_variables = [];
let assignments = [];
let statements = [];
let index = 0;*/

//function getAllData(){
//    return [functions, params, local_variables, assignments, statements];
//}

//function getData(){
/*let data = getAllData();
let all_rows = [];
for (let i = 0; i < data.length; i++){
    for(let j = 0; j < data[i].length; j++){
        all_rows.push(data[i][j]);
    }
}
all_rows.sort(compare);
return all_rows;*/
//}
/*
function compare(a,b) {
    if (a.index < b.index)
        return -1;
    else
        return 1;
}
*/
function initialize_data(parsedCode) {
    symbolTable = [];
    params = [];
    // isElse = false;
    traverse(parsedCode);
    /* functions = [];
  params = [];
  local_variables = [];
      assignments = [];
  statements = [];
  index = 0;*/








}

function traverse(o) {
    functions_or_expressions_or_return(o);
    if_while_statements(o);
    for_do_while_statements(o);
    all_variables(o);
    for (var i in o) {
        if (o[i] !== null && typeof(o[i]) == 'object'){traverse(o[i]);}
    }
}

function functions_or_expressions_or_return(o) {
    //if (o['type'] == 'FunctionDeclaration') {
    // function_dec(o);
    //}
    if (o['type'] == 'ExpressionStatement') {
        expression(o);
    }
    else if (o['type'] == 'ReturnStatement') {
    //returnstmt(o);
    }
}

function if_while_statements(o){
    for (var i in o) {

        if (o[i] == 'WhileStatement' || o[i] == 'IfStatement') {
            stmts(o);
        }
    }
}

function for_do_while_statements(o){
    for (var i in o) {

        if (o[i] == 'ForStatement' || o[i] == 'DoWhileStatement') {
            stmts(o);
        }
    }
}

function all_variables(o){
    for (var i in o) {
        if (i == 'params') {
            param(o);
        }
        else if(i == 'declarations'){
            declaration(o);
        }
    }
}



function param(o){
    for (var i in o.params) {
        params.push(o.params[i].name);
    }
}

function declaration(o){
    for (var i in o.declarations) {
        let value = null;
        if(o.declarations[i].init != null) {
            value = right_expression(o.declarations[i].init);
        }
        symbolTable.push({'line': o.declarations[i].loc.start.line, 'name': o.declarations[i].id.name, 'value': value});
    // local_variables.push({'element_type': 'var_dec', 'kind': 'variable declaration', 'type': 'var_dec', 'line': o.declarations[i].loc.start.line, 'name': o.declarations[i].id.name,
    //     'value': value, 'index': index});
    // index++;
    }

}

/*function returnstmt(object){
    let value = return_expression(object);
    //  statements.push({'element_type': 'return statement', 'statement_kind': 'return statement', 'line': object.argument.loc.start.line, 'type': object.type, 'value': value, 'index': index});
    //  index++;
}*/

function expression(object){
    let value = '';
    let exp = object['expression'];
    if(exp.type == 'UpdateExpression'){
    //update_expression(exp);
    }
    else{
        let variable = get_variable(exp);
        value = right_expression(exp.right);
        let element = check_sym_table(variable);
        element.value = value;
    //    assignments.push({'element_type': 'assignment expression', 'kind': 'assignment expression', 'line': object['expression'].loc.start.line,'name': variable, 'value':value, 'index': index});
    //     index++;
    }
}

function get_variable(object){
    if(object.left.type == 'MemberExpression'){
        return (single_element(object.left.object) + '[' + right_expression(object.left.property) + ']');
    }
    else {
        return object.left.name;
    }
}

/*function update_expression(exp){
    let name = exp.argument.name;
    //let value = name + exp.operator;

    //   assignments.push({'element_type': 'assignment expression', 'kind': 'assignment expression', 'line': exp.loc.start.line,'name': name, 'value':value, 'index': index});
    //   index++;
}*/

/*function return_expression(object){
    let value = '';
    let element = object['argument'];
    if(element.type == 'BinaryExpression'){
        value = right_expression(element.left) + element.operator + right_expression(element.right);
    }
    else{
        value = single_element(element);
    }
    return value;
}*/

function right_expression(object){
    if (object.type == 'BinaryExpression'){
        binaryExpression(object);
    }
    else if(object.type == 'MemberExpression'){
        return (single_element(object.object) + '[' + object.property.name + ']');
    }
    else if(object.type =='CallExpression'){
        return (object.callee.name + '(' + get_arguments(object.arguments) + ')');
    }
    else return single_element(object);
}
function binaryExpression(object){
    if((!isNaN(right_expression(object.left))) && (!isNaN(right_expression(object.right)))){
        return math_it_up[object.operator](Number(right_expression(object.left)), Number(right_expression(object.right)));
    }
    else return (right_expression(object.left) + object.operator + right_expression(object.right));
}
function get_arguments(object){
    let func_arguments = '';
    if(object.length > 0) {
        for (var i = 0; i < object.length - 1; i++) {
            func_arguments += right_expression(object[i])+', ';
        }
        func_arguments+= right_expression(object[i]);
    }
    return func_arguments;
}

function single_element(object){
    if(object.type=='UnaryExpression'){
        return (object.operator + single_element(object.argument));
    }
    else if (object.type=='Literal'){
        return object.raw;
    }
    else{
        let temp = check_sym_table(object.name);
        if(params.includes(object.name)){
            return object.name;
        }
        else if(Object.keys(temp).length === 0){ // not a function param - check if exists in symbol table
            return object.name;
        }
        else{
            return check_sym_table(object.name).value;
        }
    }
}

function stmts(object){
    if (object['type'] == 'IfStatement'){
        ifstmt(object);
    }
    else{
    //whilestmt(object);
    }
}



/*function whilestmt(object){
    let value = '';
    let right_element = object['test'];
    if(right_element.type == 'BinaryExpression'){
        value = right_expression(right_element.left) + ' ' + right_element.operator + ' ' + right_expression(right_element.right);
    }
    else{value = single_element(right_element);}
    let kind = 'while statement';
    //   statements.push({'element_type': 'Statement', 'statement_kind': 'Statement', 'line': object.loc.start.line, 'type':kind, 'condition':value, 'index': index});
    //   index++;
}*/

function ifstmt(object){
    let value = '';
    let right_element = object['test'];
    if(right_element.type == 'BinaryExpression'){
        value = right_expression(right_element.left) +' '+ right_element.operator + ' ' + right_expression(right_element.right);
    }
    else if(right_element.type == 'LogicalExpression'){
        value = right_expression(right_element.left) +' '+ right_element.operator + ' ' + right_expression(right_element.right);
    }
    else{value = single_element(right_element);}
    symbolTable.push({'line': object.loc.start.line, 'name': 'if', 'value': value});

    //let kind = get_if_kind(object);

    //  statements.push({'element_type': 'Statement', 'statement_kind': 'Statement', 'line': object.loc.start.line, 'type':kind, 'condition':value, 'index': index});
    //   index++;
}

/*function get_if_kind(object){
    let kind = '';
    if(isElse) {
        kind = 'else if statement';
    }
    else {
        kind = 'if statement';
    }
    if(object.alternate != null) {
        if(object.alternate.type != 'IfStatement') {
            isElse = false;
        }
        else{
            isElse = true;
        }
    }
    return kind;
}

*/


function check_sym_table(element){ // return most updated value of the element
    for(var i = 0; i < symbolTable.length; i++) {
        if (symbolTable[i].name == element) {
            return symbolTable[i];
        }
    }
    return {};
}
