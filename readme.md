## Features

* scan all rows
    * remove rows that are not EA's

* scan all headers
    * create array of unique headers (headers_row)
        
        * ignore headers that start with "salsify:"

        * remove headers that end with _n

        * if any headers that startwith [these_names], create new header called "Ingredient Info", if it doesn't exist

        * {Header extends Entity}
            {
                id: "MERGED_INGREDIENT",
                name: "Ingredient Info",
                type (lookup): "LABEL_DATASET_INGREDIENTS_A",
                value: null
            }, {
                id: "PARTCODE",
                name: "Partcode",
                type (lookup): "PARTCODE",
                value: null
            },


    * create array of reformatted rows (mapped_rows):

        * Iterate each existing row. Each row becomes a Map. 
            
            * loop each header in headers_row....
            
                * if any item_key that startwith [these_names], create merged_ingredient{Entity}
                    * {
                        id: "Ingredient Info",
                        name: "Ingredient Info",
                        type: "LABEL_DATASET_INGREDIENTS_A"
                        value: "2|Total Carbohydrate||8|g|3|%|†"
                    }
                
                * else create standard{Entity}
                    * {
                        id: "PARTCODE",
                        name: "SKU",
                        value: "6971"
                    }
    [ 
        { Map
            PARTCODE {Entity}: {
                <!-- id: ""Partcode, -->
                name: "PARTCODE",
                value: "6971"
            },
            Product ID {Entity}: {
                name: "Product ID",
                value: "00033674069714"
            }
            MERGED_INGREDIENTS {Entity}: {
                <!-- id: "Ingredient Info", -->
                name: "Ingredient Info",
                type: "LABEL_DATASET_INGREDIENTS_A"
                value: "2|Total Carbohydrate||8|g|3|%|†"
            }
        },
        ...
    ]
    
create a function based on these parameters that returns a new row for each key in the ingredients_to_merge Set
/**
 * Creates Cells for each row based on column names and merges ingredients as necessary.
 *
 * @param {Object} options - The options object.
 * @param {Array<Object>} options.rows - An array of objects representing each row of data.
 * @param {Set<string>} options.ingredients_to_merge - An array of column names to merge into one Cell.
 * @param {Array<string>} options.columnNames - An array of column names for which to create Cell instances.
 * @returns {Array<Cell[]>} - An array of arrays, each containing Cell instances for a row.
 */