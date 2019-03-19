const { renderer } = require('./modules/renderer')

$('.nav-tabs input[type=radio]').change((e) => {
    let id = e.target.id;
    console.log(id);
    let $container = $('#container');
    switch(id){
         case "tab-playing":{
            $container.empty();
            break;
        }
         case "tab-list":{
            $container.empty();
            break;
        }
        case "tab-all":{
            $container.empty();
            break;
        }
        case "tab-folders":{
             $container.empty().append(renderer('items_home', {title1:"List A", list1:{count: 0}, title2: "listB",  list2:{count: 0}}));
            break;
        }
        case "tab-shedules":{
            $container.empty();
            break;
        }
        case "tab-directories":{
            $container.empty().append(renderer('directories'));
            break;
        }
    }
});