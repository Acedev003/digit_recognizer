let canvas       = document.getElementById("canvas");
let clear_button = document.getElementById("clear_canvas");
let eval_button  = document.getElementById("guess_digit");
let quote_box    = document.getElementById("quote");
let output_block = document.getElementById("output");
let view_probs   = document.getElementById("display_probs");
let stat_modal   = document.getElementById("stat_modal");
let chart_div    = document.getElementById("chart_div");

let sketcher = new Sketchable(canvas,{graphics: {lineWidth: 10,strokeStyle: '#C2D991', fillStyle: '#C2D991'}});

let default_chartdata = [
                            ['Digit', 'Probability'],
                            ['0',0],
                            ['1',0],
                            ['2',0],
                            ['3',0],
                            ['4',0],
                            ['5',0],
                            ['6',0],
                            ['7',0],
                            ['8',0],
                            ['9',0]
                        ];

let variable_data = default_chartdata;

view_probs.style.visibility = 'hidden';
view_probs.onclick = () => 
{
    let drawChart = () =>
    {
        let chart_data =  google.visualization.arrayToDataTable(variable_data);
        let options = 
          {
            title:'Prediction Probabilities for each digit',
            backgroundColor: 'transparent',
            fontSize: 20,
            legendTextStyle: { color: '#FFF' },
            legend:{
                     position:'bottom'
                   },
            titleTextStyle: { color: '#FFF', fontSize:15 },
            is3D: true

          };
        let chart = new google.visualization.PieChart(chart_div);
        chart.draw(chart_data, options);
    };

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    stat_modal.style.display = 'block';
};


clear_button.onclick = () => 
{
    sketcher.clear();
    canvas.width  = 200;
    canvas.height = 200;

    view_probs.style.visibility = 'hidden';
    view_probs.classList.remove("fadeIn");

    variable_data = default_chartdata;
};


let model_loaded = false;
let model = null;

async function loadtf()
{   
    model = await tf.loadLayersModel('model/model.json');
    model_loaded = true;

    console.log(' - model loaded');
    console.log(' - Printing model summary : ');
    console.log(model.summary());
}
loadtf();


eval_button.onclick = () =>
{
    if(!model_loaded)
    {
        alert("AI is still loading");
        return;
    }

    image = tf.browser.fromPixels(canvas,1).resizeBilinear([28,28]);

    //preview_image = tf.cast(image,'int32');
    //tf.browser.toPixels(preview_image,canvas);
    
    image = tf.div(image,255);
    image = image.expandDims();
    preds = model.predict(image);

    let output = -1;
    preds.data().then((scores) =>
    {
        console.log(scores);
        
        guess = scores.indexOf(Math.max(...scores));
        prob  = scores[guess];
        
        quote.innerHTML = ` I am ${(prob*100).toFixed(2)}% certain that the digit you drew somewhat looked like ... `;
        output_block.innerText = `${guess}`;
        
        for(let i = 1; i < 11; i++)
        {
            variable_data[i][1] = Number( scores[i-1].toFixed(2));
        }

        view_probs.style.visibility = 'visible';
        view_probs.classList.add('fadeIn');

    });
    
    
};