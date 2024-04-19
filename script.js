
let table;

function initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        table.destroy();
    }
    table = $('#dataTable').DataTable({
        scrollY: '50vh',
        scrollCollapse: true,
        paging: true
    });
}

$(document).ready(function () {
    initializeDataTable();
});

function processFiles() {
    // Clear the table
    table.clear().draw();

    const files = document.getElementById('fileInput').files;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const lines = event.target.result.split('\n');
            lines.forEach(line => {
                if (line.trim() !== '') {
                    const parts = line.split('\t');
                    const ner_id = parts[0];
                    const file_details = parts[1].split(' ');

                    // Ensure this array has exact matches to column number
                    const rowData = [
                        ner_id, // NER ID
                        file.name, // File name
                        '', // Entity
                        '', // Start
                        '', // End
                        '', // Entity Value
                        '', // NER Type
                        '', // Attribute
                        '', // Belongs To
                        '', // Relation
                        '', // Related NE1
                        ''  // Related NE2
                    ];

                    if (line.startsWith("T")) {
                        rowData[2] = file_details[0]; // Entity
                        rowData[3] = file_details[1]; // Start
                        rowData[4] = file_details[2]; // End
                        rowData[5] = parts[2]; // Entity Value
                        rowData[6] = 'Entity'; // NER Type
                    } else if (line.startsWith("A")) {
                        rowData[7] = file_details[0]; // Attribute
                        rowData[8] = file_details[1].replace('ID:', ''); // Belongs To
                        rowData[6] = 'Attribute'; // NER Type
                    } else if (line.startsWith("R")) {
                        rowData[9] = file_details[0]; // Relation
                        rowData[10] = file_details[1].replace('Arg1:', ''); // Related NE1
                        rowData[11] = file_details[2].replace('Arg2:', ''); // Related NE2
                        rowData[6] = 'Relation'; // NER Type
                    }

                    table.row.add(rowData).draw(false);
                }
            });
        };
        reader.readAsText(file);
    });
}

function downloadCSV() {
    let data = [];
    const header = [
        'NER ID',
        'File',
        'Entity',
        'Start',
        'End',
        'Entity Value',
        'NER Type',
        'Attribute',
        'Belongs To',
        'Relation',
        'Related NE1',
        'Related NE2'
    ];
    data.push(header);
    const rows = table.rows().data();
    rows.each(function (value, index) {
        data.push(value);
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
