import file
1. Validate that we have either a Salsify or Pipeify export  
    * Salsify export will have "salsify:"
    * Pipeify will have metadata "Pipeify"
    * If theses conditions dont exist, Toast()

dom.js 
- dom.js handles import event and gets data
- xlsx.js handles turning data into json

2. Handle each case as the structure will be different
