/*
 Mimimicing Breath

*/

//TODO - look at shaping onePole and making a trickle state for when it's inactive

let keyFrames;
let env;
let env2;
let t;
let breath;
let breatAmp;

let noiseGen;

let counter;
let showGraphs;

let toggle;
let onePole;


function preload()
{
  soundFormats('wav');
  breath = loadSound('assets/breath.wav');
}


function setup()
{
  createCanvas(512,512);
  frameRate(60);

  keyFrames = [];

  let controlPoints = [];

  controlPoints.push(createVector(-width * 0.4,0));
  controlPoints.push(createVector(-width/2,-300));
  controlPoints.push(createVector(-width/2,-200));
  controlPoints.push(createVector(width/2,-200));
  controlPoints.push(createVector(width/2,-300));
  controlPoints.push(createVector(width * 0.4,0));

  let vertices = calcBezierVertices(100,controlPoints);

  keyFrames.push(new SimpleLine(vertices));

  controlPoints = [];

  controlPoints.push(createVector(-width/2,-50));
  controlPoints.push(createVector(0,100));
  controlPoints.push(createVector(width/2,-50));

  vertices = calcBezierVertices(100,controlPoints);

  keyFrames.push(new SimpleLine(vertices));

  let data = calcLinEnv(100,
    [0,0,0.95,1,0.95,0,0],
    [0.01,0.15,0.05,0.15,0.45,0.19 ],
    [1,0.6,0.5,0.5 ,3,1]
  );

  env = new EnvelopeData(data);


  data = calcSineEnv(100,0,PI,1,1.5);

  env2 = new EnvelopeData(data);


  noiseGen = new NoiseGen(0,width);

  noiseGen.noiseAmp = 30;
  noiseGen.setSampleHeading(PI/4);
  noiseGen.setSampleTheta(PI*7/4);
  noiseGen.setSampleMagnitude(20);


  breathAmp = new p5.Amplitude();
  toggle = new Toggle();
  onePole = new OnePole2(0.4 ,0.7);

  t = 0;
  counter = 0;
  showGraphs = false;

}

function draw()
{
  background(255);
  noFill();

  if(breath.isPlaying())
  {
    let p = (((millis()-counter)/1000)%breath.duration())/breath.duration();
    t = env.lin_value(p);
    noiseGen.update();
    noiseGen.noiseAmp = map(breathAmp.getLevel(),0,0.1,0,35);
    noiseGen.setSampleInc(map(breathAmp.getLevel(),0,0.1,0.3,0.05));

    toggle.process(breathAmp.getLevel());

    if(toggle.toggle && toggle.isActive)
    {
      onePole.targetVal = 1;
      onePole.process();
    }
    else if (!toggle.toggle && toggle.isActive)
    {
      onePole.targetVal = 0;
      onePole.process();
    }

    //t = onePole.z;
  }
//noiseGen.update();


  //draw the shape
  stroke(0);
  translate(width/2,height/2);

  let pv;

  beginShape();
  for(let i = 0; i < 100; i++)
  {
    let v1 = keyFrames[0].calcVertex(i/100);
    let v2 = keyFrames[1].calcVertex(i/100);
    v1.mult(t);
    v2.mult(1-t);
    let vsum = p5.Vector.add(v1,v2);

    let normal = createVector(0,0);

    if(pv != undefined  )
    {
      let v = p5.Vector.sub(vsum,pv);
      normal = createVector(-v.y,v.x);
      let n = noiseGen.value(i/100);
      let xmul = env2.lin_value(i/100);
      normal.setMag(n * xmul);
    }


    vertex(vsum.x + normal.x, vsum.y + normal.y);
    pv = vsum;
  }
  endShape();


  if(showGraphs)
  {

    //draw the envelope
    stroke(255,0,0);
    beginShape();
    for(let i = 0; i < 100; i++)
    {
      let y = -env.lin_value(i/100) * height/2;
      let x = -width/2 + i * width/100;
      vertex(x, y);
    }
    endShape();

    //draw the noiseGen
    stroke(0,125 ,0);
    beginShape();
    for(let i = 0; i < 100; i++)
    {
      let n = noiseGen.value(i/100);

      vertex(-width/2 + i * width/100, n );
    }
    endShape();

  }


}

function keyPressed()
{
  if(key == ' ')
  {
    if(!breath.isPlaying())
    {
      counter = millis();
      breath.loop();
    }
    else
    {
      breath.stop();
    }
  }

  if(key == 'v')
  {
    showGraphs = !showGraphs;
  }
}
