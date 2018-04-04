var component_list = [
    {
        "key": "load:data",
        "name": "Load Data",
        "img": "/img/component-icon/data.png",
        "modal": "/modals/modal-load-file.html",
        "input": 0,
        "output": 1,
        "load_modal": function(metadata, id){
            $("#modal-file-select").html("");
            // Load Files
            $.get("/available/files", function(data){
                data.forEach(function(item, index){
                    $("#modal-file-select").append('<option value="' + item + '">' + item + '</option>');
                });
                if(id in metadata){
                    $("#modal-file-select").val(metadata[id]["file"]);
                }
            });
        },
        "submit_modal": function(metadata, id){
            var file = $("#modal-file-select").val();
            $.get("/files/shape/" + file, function(shape){
                metadata[id] = {
                    "file": file,
                    "shape": shape
                }
            });
        }
    },
    {
        "key": "process:join",
        "name": "Join Module",
        "img": "/img/component-icon/join.png",
        "modal": "/modals/modal-join.html",
        "input": 2,
        "output": 1,
        "load_modal": function(metadata, id){
            var data = $('#content').flowchart('getData');
            var left_shape = {};
            var right_shape = {};
            $.each(data['links'], function(index, item){
                if(item['toOperator'] == id){
                    if(item['toConnector'] == 'input_1'){
                        left_shape = metadata[item['fromOperator']]['shape'];
                    }
                    if(item['toConnector'] == 'input_2'){
                        right_shape = metadata[item['fromOperator']]['shape'];
                    }
                }
            });
            $("#process-join-left").html("");
            $("#process-join-right").html("");
            $.each(left_shape, function(index, item){
                $("#process-join-left").append('<option value="' + index + '">' + index + '</option>');
            });
            $.each(right_shape, function(index, item){
                $("#process-join-right").append('<option value="' + index + '">' + index + '</option>');
            });
            if(id in metadata){
                $("#process-join-left").val(metadata[id]['left_on']);
                $("#process-join-right").val(metadata[id]['right_on']);
                $("#process-join-how").val(metadata[id]['how']);
            }
        },
        "submit_modal": function(metadata, id){
            var left_val = $("#process-join-left").val();
            var right_val = $("#process-join-right").val();
            var how = $("#process-join-how").val();
            metadata[id] = {
                "left_on": left_val,
                "right_on": right_val,
                "how": how
            }
        }
    },
    {
        "key": "process:group",
        "name": "Group Module",
        "img": "/img/component-icon/group.png",
        "input": 1,
        "output": 1
    },
    {
        "key": "process:filter",
        "name": "Filter Module",
        "img": "/img/component-icon/filter.png",
        "input": 1,
        "output": 1
    },
    {
        "key": "process:merge",
        "name": "Merge Module",
        "img": "/img/component-icon/merge.png",
        "input": 2,
        "output": 1
    }
];

var operatorI = 0;
var metadata = {};

for(var i in component_list){
    data = component_list[i];
    $("#component-list-container").append('<div class="card text-white bg-dark mb-3 draggable" style="max-width: 20rem;" data-process="' + data['key'] + '"><div class="card-body"><div class="text-center"><img src="/static' + data['img'] + '" alt="" class="custom-component-icon"><h5 class="card-title custom-component-title">' + data['name'] + '</h5></div></div></div>');
}

function delete_selected(){
    $('#content').flowchart('deleteSelected');
}

function disable_input(target){
    $("#" + target + " :input").prop("disabled", true);
    $("#" + target + " :select").prop("disabled", true);
}

function show_data(){
    var data = $('#content').flowchart('getData');
    alert(JSON.stringify(data));
    alert(JSON.stringify(metadata));
}

function remake_feet(id, n_feet){
    var data = $('#content').flowchart('getData');
    var new_feet = {};
    for(var i = 0; i < n_feet; i++){
        new_feet['output_' + (i + 1)] = {'label': 'Out'}
    }
    var link = [];
    $.each(data['links'], function(index, item){
        if(item['fromOperator'] == id || item['toOperator'] == id){
        link.push({
            "id": index,
            "value": item
        });
        }
    });
    data['operators'][id]['properties']['outputs'] = new_feet;
    $('#content').flowchart('deleteOperator', id);
    $('#content').flowchart('createOperator', id, data['operators'][id]);
    link.forEach(function(item, index){
        $('#content').flowchart('createLink', item['id'], item['value']);
    });
}

$(document).ready(function(){
    // Init Flowchart
    $('#content').flowchart({
        data: {},

        // Operator Select
        onOperatorSelect: function(operatorId){
            var tmp = operatorId.split(":");
            var target = component_list.find(x => x.key == tmp[0] + ':' + tmp[1]);
            $("#component-modal-body").load(target.modal, function(){
                $("#component-modal-title").html(target.name);

                // Additional Library Needs
                if(target.key == 'load:data'){
                    $("#modal-file-select").select2();
                }
                
                target.load_modal(metadata, operatorId);

                var data = $('#content').flowchart('getData');
                var current_feet = Object.keys(data['operators'][operatorId]['properties']['outputs']).length;
                $("#component-modal-submit").data("id", operatorId);
                $("#n_feet").val(current_feet);

                // Check if Matadata Already Set
                if(operatorId in metadata){
                    //Disable Input
                    disable_input('component-modal-body');
                }
            });
            $("#component-modal").modal();
            return true;
        }
    });

    // Init Dragable
    $('.draggable').draggable({
        revert: "invalid",
        appendTo: 'body',
        stack: ".draggable",
        helper: 'clone'
    });

    $('.droppable').droppable({
        accept: ".draggable",
        drop: function(event, ui){
            leftPosition  = ui.offset.left - $(this).offset().left;
            topPosition   = ui.offset.top - $(this).offset().top;
            var id = ui.draggable.attr("data-process");
            var target = component_list.find(x => x.key == id);
            var operatorId = id + ':operator:' + operatorI;
            var input_set = {};
            var output_set = {};
            for(var q = 0; q < target.input; q++){
                input_set['input_' + (q + 1)] = {
                    label: "In"
                };
            }
            for(var q = 0; q < target.output; q++){
                output_set['output_' + (q + 1)] = {
                    label: "Out"
                };
            }
            var operatorData = {
                top: topPosition,
                left: leftPosition,
                properties: {
                    title: target.name,
                    key: operatorId,
                    img: target.img,
                    inputs: input_set,
                    outputs: output_set
                }
            };
            
            operatorI++;
                
            $('#content').flowchart('createOperator', operatorId, operatorData);
        }
    });

    $("#component-modal-submit").click(function(){
        var n_feet = $("#n_feet").val();
        var id = $("#component-modal-submit").data("id");
        remake_feet(id, n_feet);
        
        var tmp = id.split(":");
        var target = component_list.find(x => x.key == tmp[0] + ':' + tmp[1]);
        target.submit_modal(metadata, id);

        $("#component-modal").modal('hide');
    });
});
