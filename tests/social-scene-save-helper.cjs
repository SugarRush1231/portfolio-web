'use strict';
async function saveScene(scope,format){
 await scope.locator('#save-output').click();
 await scope.locator('[data-save-format="'+format+'"]').click();
}
module.exports={saveScene};
