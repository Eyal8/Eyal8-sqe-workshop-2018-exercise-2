import * as esprima from 'esprima';

const parseCode = (codeToParse, function_arguments) => {
    let parsedCode = esprima.parseScript(codeToParse, { loc: true });
    initialize_data(parsedCode);
    substitute_function();
    evaluate_code(function_arguments);
    return [final_function, final_function_array];
};

export{initialize_data};
export {parseCode};

let argument_with_values = {};
let final_function_array = [];
let symbolTable = [];
let relevant_lines = [];
let params = [];
let isElse = false;
let tabs = 0;
let function_line_start = 0;
let function_line_end = 0;
let globals = [];
let final_function = '';
let before_substitution = true;
let math_it_up = {
    '+': function (x, y) { return x + y; },
    '-': function (x, y) { return x - y; },
    '*': function (x, y) { return x * y; },
    '/': function (x, y) { return x / y; }
};

function evaluate_conditions(lines){
    for(let i = 0; i < lines.length; i++) {
        let current_line = lines[i];
        let if_result = false;
        if (current_line.type == 'if statement' || current_line.type == 'else if statement'){
            evaluate_conditions(current_line.statements);
            if_result = evaluate_if(current_line, argument_with_values);
            if(if_result) {
                true_condition(current_line.line);
            }
            else{
                false_condition(current_line.line);
            }
        }
    }
}
function true_condition(line){
    for (let j = 0; j < final_function_array.length; j++) {
        if (final_function_array[j].type != undefined && final_function_array[j].line == line) {
            final_function_array[j].isTrue = true;
        }
    }
}
function false_condition(line){
    for (let j = 0; j < final_function_array.length; j++) {
        if (final_function_array[j].type != undefined && final_function_array[j].line == line) {
            final_function_array[j].isTrue = false;
        }
    }
}

function evaluate_code(function_arguments){
    function_arguments = function_arguments.trim();
    let argument_values = function_arguments.split(',');
    let param_index = 0;
    for(let i = 0; i < argument_values.length; i++){
        if(argument_values[i][0] == '['){ // array element
            let j = 1;
            let new_array = new Array();
            new_array.push(argument_values[i].substring(1));
            while(!argument_values[i+j].includes(']')){
                new_array.push(argument_values[i+j]);
                j++;}
            new_array.push(argument_values[i+j].substring(0, argument_values[i+j].length - 1));
            argument_with_values[params[param_index]] = new_array;
            i += j;}
        else{argument_with_values[params[param_index]] = argument_values[i];}
        param_index ++;
    }
    evaluate_conditions(relevant_lines);
}
function evaluate_if(line){
    let if_statement = line.value;
    let string_to_evaluate = '';
    if(if_statement.left != undefined){
        let left_side = if_statement.left.replace(/\s/g, '');
        let operator = if_statement.operator;
        let right_side = if_statement.right.replace(/\s/g, '');
        let splited_left = left_side.split('');
        let splited_right = right_side.split('');
        evaluate_one_side_predicate(splited_left);
        evaluate_one_side_predicate(splited_right);
        string_to_evaluate = splited_left.join(' ') + operator + splited_right.join(' ');
    }
    else{ // single variable in condition
        if_statement = evaluate_single_predicate(if_statement);
        string_to_evaluate = if_statement;
    }
    return eval(string_to_evaluate);
}
function evaluate_single_predicate(condition){
    if(condition.charAt(0) == '!'){
        //if(condition.substring(1) in argument_with_values){
        condition = '!' + argument_with_values[condition.substring(1)];
        //}
    }
    else { // if(condition in argument_with_values)
        condition = argument_with_values[condition];
    }
    return condition;
}
function evaluate_one_side_predicate(side){
    for(let i = 0; i < side.length; i++) {
        if (side[i] in argument_with_values){
            if(Array.isArray(argument_with_values[side[i]])){
                let array_index = '';
                let j = 2;
                while(side[i+j] != ']'){
                    array_index += side[i+j];
                    j++;
                }
                side[i] = argument_with_values[side[i]][array_index];
                side.splice(i+1,2+array_index.length);
            }
            else{
                side[i] = argument_with_values[side[i]];
            }
        }
    }
}
function initialize_data(parsedCode) {
    argument_with_values = {};
    final_function_array = [];
    symbolTable = [];
    params = [];
    relevant_lines = [];
    isElse = false;
    tabs = 0;
    function_line_start = 0;
    function_line_end = 0;
    globals = [];
    final_function = '';
    before_substitution = true;
    get_function_start_and_end(parsedCode);
    get_all_globals(parsedCode);
    before_substitution = false;
    traverse(parsedCode);
}
const map_to_type = {
    'function declaration': add_function,
    'if statement': add_if_statement,
    'else if statement': add_else_if_statement,
    'else': add_else_statement,
    'while statement': add_while_statement,
    'return': add_return_statement,
    'assignment': add_assignment
};
function substitute_function(){
    let current_line = '';
    for(let i = 0; i < relevant_lines.length; i++){
        let line_type = relevant_lines[i].type;
        map_to_type[line_type](relevant_lines[i]);
    }
    current_line = '}';
    final_function_array.push(current_line);
    final_function += current_line;
}
function add_function(relevant_line){
    let current_line = '';
    current_line = 'function ' + relevant_line.name + '(';
    let j = 0;
    for (j; j < params.length - 1; j++){
        current_line += params[j] + ', ';
    }
    if (params.length > 1){
        current_line += params[j];
    }
    current_line += '){\n';
    final_function_array.push(current_line);
    final_function += current_line;
}

function add_if_statement(relevant_line){
    let current_line = '';
    let if_statement = '';
    if(relevant_line.value.left != undefined){
        if_statement = relevant_line.value.left + ' ' + relevant_line.value.operator + ' ' + relevant_line.value.right;
    }
    else{
        if_statement = relevant_line.value;
    }
    current_line = add_tabs(relevant_line.tabs) + 'if(' + if_statement + '){\n';
    final_function_array.push({'type':'if','value':current_line,'line':relevant_line.line, 'isTrue':true});
    final_function += current_line;
    add_all_predicate_statements(relevant_line);
}
function add_else_if_statement(relevant_line){
    let current_line = '';
    let else_if_statement = '';
    if(relevant_line.value.left != undefined) {
        else_if_statement = relevant_line.value.left + ' ' + relevant_line.value.operator + ' ' + relevant_line.value.right;
    }
    else{
        else_if_statement = relevant_line.value;
    }
    current_line = add_tabs(relevant_line.tabs) + 'else if(' + else_if_statement + '){\n';
    final_function_array.push({'type':'if','value':current_line,'line':relevant_line.line, 'isTrue':true});
    final_function += current_line;
    add_all_predicate_statements(relevant_line);
}
function add_else_statement(relevant_line){
    let current_line = '';
    current_line = add_tabs(relevant_line.tabs) + 'else{\n';
    final_function_array.push(current_line);
    final_function += current_line;
    add_all_predicate_statements(relevant_line);
}
function add_while_statement(relevant_line){
    let current_line = '';
    let while_statement = '';
    if(relevant_line.value.left != undefined){
        while_statement = relevant_line.value.left + ' ' + relevant_line.value.operator + ' ' + relevant_line.value.right;
    }
    else{
        while_statement = relevant_line.value;
    }
    current_line = add_tabs(relevant_line.tabs) + 'while(' + while_statement + '){\n';
    final_function_array.push(current_line);
    final_function += current_line;
    add_all_predicate_statements(relevant_line);
}
function add_return_statement(relevant_line){
    let current_line = '';
    current_line = add_tabs(relevant_line.tabs) + 'return ' + relevant_line.value + ';';
    final_function_array.push(current_line);
    final_function += current_line;
}
function add_assignment(relevant_line){
    if(params.includes(relevant_line.name) || globals.includes(relevant_line.name)){
        let current_line = '';
        current_line = add_tabs(relevant_line.tabs) + relevant_line.name + ' = ' + relevant_line.value + ';';
        final_function_array.push(current_line);
        final_function += current_line;
    }
}

function add_all_predicate_statements(relevant_line){
    let current_line = '';
    let statements = relevant_line.statements;
    for (let j = 0; j < statements.length; j++){
        let statement_type = statements[j].type;
        map_to_type[statement_type](statements[j]);
    }
    current_line = add_tabs(relevant_line.tabs) + '}\n';
    final_function_array.push(current_line);
    final_function += current_line;
}
function add_tabs(tabs_number){
    let tabs_string = '';
    for(let i = 0; i < tabs_number; i++){
        tabs_string += '\t';
    }
    return tabs_string;
}
function get_function_start_and_end(o){
    if (o['type'] == 'FunctionDeclaration') {
        function_dec(o, true);
    }
    for (var i in o) {
        if (o[i] !== null && typeof(o[i]) == 'object'){get_function_start_and_end(o[i]);}
    }
}
function get_all_globals(o){
    dec_or_exp(o);
    for (var i in o) {
        if (o[i] !== null && typeof(o[i]) == 'object'){get_all_globals(o[i]);}
    }
}
function dec_or_exp(o){
    for (var i in o) {
        if(i == 'declarations'){
            declaration(o);
        }
    }
    if (o['type'] == 'ExpressionStatement') {
        expression(o);
    }
}
function traverse(o) {
    functions_or_expressions_or_return(o);
    if_while_statements(o);
    all_variables(o);
    let if_or_while = check_not_if_and_not_while(o);
    for (var i in o) {
        if (o[i] !== null && typeof(o[i]) == 'object' && if_or_while){traverse(o[i]);}
    }
}
function check_not_if_and_not_while(o){
    if(o.type =='IfStatement'){
        return false;
    }
    if(o.type == 'WhileStatement'){
        return false;
    }
    return true;
}
function functions_or_expressions_or_return(o) {
    if (o['type'] == 'FunctionDeclaration') {
        function_dec(o);
    }
    if (o['type'] == 'ExpressionStatement') {
        expression(o);
    }
    else if (o['type'] == 'ReturnStatement') {
        returnstmt(o);
    }
}
function function_dec(o, first_time){
    if(first_time != undefined){
        function_line_start = o.loc.start.line;
        function_line_end = o.loc.end.line;
    }
    else{
        relevant_lines.push({'line': o.loc.start.line, 'type': 'function declaration', 'name': o.id.name, 'tabs': tabs});
        tabs += 1;
    }
}
function if_while_statements(o){
    for (var i in o) {
        if (o[i] == 'WhileStatement' || o[i] == 'IfStatement') {
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
function check_if_global(dec_line){
    return (dec_line >= function_line_start && dec_line <= function_line_end);
}
function declaration(o){
    for (var i in o.declarations) {
        let value = '';
        if(o.declarations[i].init != null) {
            value = right_expression(o.declarations[i].init);
        }
        let dec_line = o.declarations[i].loc.start.line;
        let is_in_function = check_if_global(dec_line);
        if(!is_in_function){ //global declaration checked on first time
            check_if_before_substitution(o.declarations[i], value);

        }
        else if(!before_substitution){ // in function and in substitution phase
            symbolTable.push({'line': o.declarations[i].loc.start.line, 'name': o.declarations[i].id.name, 'value': value});
        }
    }

}
function check_if_before_substitution(o, value){
    if(before_substitution){
        symbolTable.push({'line': o.loc.start.line, 'name': o.id.name, 'value': value});
        globals.push(o.id.name);
    }
}
function returnstmt(object, statements){
    let value = return_expression(object, statements);
    if(statements != undefined){
        statements.push({'line': object.argument.loc.start.line, 'name': '', 'type': 'return', 'value': value, 'tabs': tabs});
    }
    else{
        relevant_lines.push({'line': object.argument.loc.start.line, 'name': '', 'type': 'return', 'value': value, 'tabs': tabs});
    }
}
function return_expression(object, statements){
    let value = '';
    let element = object['argument'];
    if(element.type == 'BinaryExpression'){
        value = right_expression(element.left, statements) + ' ' + element.operator + ' ' + right_expression(element.right, statements);
    }
    else{
        value = single_element(element, statements);
    }
    return value;
}
function expression(object, statements){
    let dec_line = object['expression'].loc.start.line;
    let is_in_function = check_if_global(dec_line);
    if(!is_in_function){
        global_expression(object);}
    else if(!before_substitution){ // in function and in substitution phase
        let value = '';
        let exp = object['expression'];
        let variable = get_variable(exp);
        let var_index = check_sym_table(variable);
        value = right_expression(exp.right, statements);
        if(statements != undefined){
            statements.push({'line': object['expression'].loc.start.line, 'name': variable, 'type': 'assignment', 'value': value, 'tabs': tabs});
        }
        else{ // (statements == undefined)
            symbolTable[var_index].value = value;
            relevant_lines.push({'line': object['expression'].loc.start.line, 'name': variable, 'type': 'assignment', 'value': value, 'tabs': tabs});
        }
    }
}
function global_expression(object){
    if(before_substitution){ // global expression
        let value = '';
        let exp = object['expression'];
        let variable = get_variable(exp);
        let var_index = check_sym_table(variable);
        value = right_expression(exp.right);
        symbolTable[var_index].value = value;
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

function right_expression(object, statements){
    if (object.type == 'BinaryExpression'){
        return binaryExpression(object, statements);
    }
    else if(object.type == 'MemberExpression'){
        return (single_element(object.object, statements) + '[' + single_element(object.property, statements) + ']');
    }

    else return single_element(object, statements);
}
function get_numbers_and_variables(elements){
    let numbers = '';
    let variables = '';
    for (let i = 0; i < elements.length; i++) {
        if (i % 2 == 0) {
            if (isNaN(elements[i])) {
                variables += elements[i] + ' ';}
            else {
                numbers += elements[i] + ' ';}
        }
        else {
            if (isNaN(elements[i + 1])) {
                variables += elements[i] + ' ';
            }
            else {
                numbers += elements[i] + ' ';}
        }
    }
    return [numbers, variables];
}
function eval_numbers(elements) {
    let numbers_and_variables = get_numbers_and_variables(elements);
    let numbers = numbers_and_variables[0];
    let variables = numbers_and_variables[1];
    if(numbers.split(' ').length > 2){
        return numbers_to_evaluate(variables, numbers);
    }
    else{
        return variables + ' ' + numbers;
    }
}
function numbers_to_evaluate(variables, numbers){
    if(variables.charAt(0) === '+'){
        variables = variables.substr(2);
    }
    if (numbers.charAt(0) === '*' || numbers.charAt(0) === '/'){
        numbers = numbers.substr(2);
    }
    let numbers_evaluated = eval(numbers);
    if(numbers_evaluated.toString().charAt(0) == '-'){
        return variables + numbers_evaluated;
    }
    else{
        return variables + ' + ' + eval(numbers);
    }
}
function remove_empty_chars(all_exp){
    for(let i = 0; i < all_exp.length; i++){
        if(all_exp[i] == ''){
            all_exp.splice(i, 1);
        }
    }
}
function evaluate_binary_exp(object, statements, left, right){
    let operators = '*/';
    if((!isNaN(left)) && (!isNaN(right))){
        return math_it_up[object.operator](Number(right_expression(object.left, statements)), Number(right_expression(object.right, statements)));
    }
    else if(operators.includes(object.operator) && left.length>2){
        return '('+right_expression(object.left, statements) + ') ' + object.operator + ' ' + right_expression(object.right, statements);
    }
    else return (right_expression(object.left, statements) + ' ' + object.operator + ' ' + right_expression(object.right, statements));
}
function binaryExpression(object, statements) {
    let left = right_expression(object.left, statements).toString().trim();
    let right = right_expression(object.right, statements).toString().trim();
    let elements = left.toString().split(' ');
    let right_element_with_op = (object.operator + ' ' + right);
    right_element_with_op = right_element_with_op.replace(/\s+/g,' ');
    let splitted_right = right_element_with_op.split(' ');
    let all_exp = elements.concat(splitted_right);
    remove_empty_chars(all_exp);
    if((object.operator == '+' || object.operator == '-') && all_exp.length > 3){
        let eval_exp = eval_numbers(all_exp);
        return eval_exp;
    }
    else{
        return evaluate_binary_exp(object, statements, left, right);
    }
}

function single_element(object, statements){
    if(object.type=='UnaryExpression'){
        return (object.operator + single_element(object.argument));
    }
    else if (object.type=='Literal'){
        return object.raw;
    }
    else{ // identifier
        return identifier(object, statements);
    }
}
function identifier(object, statements){
    let var_index = check_sym_table(object.name);
    if(params.includes(object.name)){
        return object.name;
    }
    else if(statements != undefined){
        let predicate_index = check_current_sym_table(object.name, statements);
        if(predicate_index != -1){
            return statements[predicate_index].value;
        }
    }
    if(var_index == -1){ // variable not in symbol table
        return object.name;
    }
    else{
        return symbolTable[var_index].value;
    }
}

function stmts(object){
    if (object['type'] == 'IfStatement'){
        ifstmt(object);
    }
    else{
        whilestmt(object);
    }
}



function whilestmt(object){
    let value = '';
    let right_element = object['test'];
    if(right_element.type == 'BinaryExpression'){
        value = {'left': right_expression(right_element.left), 'operator': right_element.operator, 'right': right_expression(right_element.right)};
    }
    else{value = single_element(right_element);}
    let kind = 'while statement';
    let while_to_insert = {'line': object.loc.start.line, 'type': kind, 'value': value, 'statements': [], 'tabs': tabs};
    relevant_lines.push(while_to_insert);
    get_predicat_statements(object.body, while_to_insert.statements);
}

function ifstmt(object, statements){
    let value = '';
    let right_element = object['test'];
    if(right_element.type == 'BinaryExpression'){
        value = {'left': right_expression(right_element.left), 'operator': right_element.operator, 'right': right_expression(right_element.right)};
    }
    /* else if(right_element.type == 'LogicalExpression'){
        value = {'left': right_expression(right_element.left), 'operator': right_element.operator, 'right': right_expression(right_element.right)};
    }*/
    else{value = single_element(right_element);}
    let kind = get_if_kind(object);
    if(statements == undefined){
        first_if(object, kind, value);

    }
    else{
        nested_if(object, statements, kind, value);
    }
}
function first_if(object, kind, value){
    let if_to_insert = {'line': object.loc.start.line, 'name': '', 'type': kind, 'value': value, 'statements': [], 'tabs': tabs};
    relevant_lines.push(if_to_insert);
    get_predicat_statements(object.consequent, if_to_insert.statements);

    if(object.alternate != null && object.alternate.type == 'IfStatement'){
        ifstmt(object.alternate);
    }
    else if(object.alternate != null){
        let else_to_insert = {'line': object.alternate.loc.start.line, 'name': '', 'type': 'else', 'value': value, 'statements': [], 'tabs': tabs};
        relevant_lines.push(else_to_insert);
        get_predicat_statements(object.alternate, else_to_insert.statements);
    }
}
function nested_if(object, statements, kind, value){
    let if_to_insert = {'line': object.loc.start.line, 'name': '', 'type': kind, 'value': value, 'statements': [], 'tabs': tabs};
    statements.push(if_to_insert);
    get_predicat_statements(object.consequent, if_to_insert.statements);

    if(object.alternate != null && object.alternate.type == 'IfStatement'){
        ifstmt(object.alternate, statements);
    }
    else if(object.alternate != null){ // else
        let else_to_insert = {'line': object.alternate.loc.start.line, 'name': '', 'type': 'else', 'value': value, 'statements': [], 'tabs': tabs};
        statements.push(else_to_insert);
        get_predicat_statements(object.alternate, else_to_insert.statements);
    }
}
function get_predicat_statements(object, statements){
    tabs ++;
    for(let i in object.body){
        if (object.body[i].type == 'ExpressionStatement'){
            expression(object.body[i], statements);
        }
        else if(object.body[i].type == 'ReturnStatement'){
            returnstmt(object.body[i], statements);
        }
        else  { //(object.body[i].type == 'IfStatement')
            ifstmt(object.body[i], statements);
        }
    }
    tabs --;
}
function get_if_kind(object){
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

function check_sym_table(element){ // return most updated value of the element
    for(var i = 0; i < symbolTable.length; i++) {
        if (symbolTable[i].name == element) {
            return i;
        }
    }
    return -1;
}

function check_current_sym_table(element, statements){
    for(var i = 0; i < statements.length; i++) {
        if (statements[i].name == element) {
            return i;
        }
    }
    return -1;
}
