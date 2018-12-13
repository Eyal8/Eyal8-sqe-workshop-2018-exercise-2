import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let function_arguments = $('#argumentsPlaceholder').val();
        let string_and_object_function = parseCode(codeToParse, function_arguments);
        insert_rows_to_table(string_and_object_function[1]);
    });
});

function insert_rows_to_table(final_function_array){
    let output_table = document.getElementById('symbolFunc');
    while (output_table.firstChild) {output_table.removeChild(output_table.firstChild);}
    let span_tag = null;
    let current_element_to_add = null;
    for(let i = 0; i < final_function_array.length; i++){
        span_tag = document.createElement('P');
        if(final_function_array[i].type != undefined){
            if(final_function_array[i].isTrue){
                span_tag.classList.add('highlight_true');
                current_element_to_add = document.createTextNode(final_function_array[i].value);
                span_tag.appendChild(current_element_to_add);}
            else{
                span_tag.classList.add('highlight_false');
                current_element_to_add = document.createTextNode(final_function_array[i].value);
                span_tag.appendChild(current_element_to_add);}}
        else{
            current_element_to_add = document.createTextNode(final_function_array[i]);
            span_tag.appendChild(current_element_to_add);        }
        output_table.appendChild(span_tag);}}

