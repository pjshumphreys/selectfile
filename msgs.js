var MSGS = (function() {
  var i, MSGS = {},
  constantsList = [
    'TEST_FOR_IDB',
    'IDB_STATUS',
    'MAKE_FAKE_IDB',
    'UPDATE_FAKE_IDB',
    'FAKE_IDB_UPDATED',  
    'RUN_COMMAND',
    'OUTPUT_TEXT',
    'COMMAND_FINISHED'
  ];
  
  for(i in constantsList) {
    if(constantsList.hasOwnProperty(i)) {
      MSGS[constantsList[i]] = i;
    }
  }
  
  return MSGS;   
})();
