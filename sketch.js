/*
 Mimimicing Breath

*/

let keyFrames;
let env;
let t;

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

  //let data = calcSineEnv(100,0,PI,1,3);
  let data = calcSplineEnv(100,
    [0,0,0.05,0.8,
     1,1,0.05,0,
     0],
    [0.1,0.1,0.2,0.2,
      0.3,1.5,0.1,0.1]
  );

  env = new EnvelopeData(data);


  t = 0;

}

function draw()
{
  background(255);
  noFill();


  let p = ((millis()/1000)%10)/10;
  t = env.lin_value(p);

  //console.log(t);

  //draw the shape
  stroke(0);
  translate(width/2,height/2);
  beginShape();
  for(let i = 0; i < 100; i++)
  {
    let v1 = keyFrames[0].calcVertex(i/100);
    let v2 = keyFrames[1].calcVertex(i/100);
    v1.mult(t);
    v2.mult(1-t);
    let vsum = p5.Vector.add(v1,v2);
    vertex(vsum.x, vsum.y);
  }
  endShape();


  //draw the envelope
  stroke(255,0,0);
  beginShape();
  for(let i = 0; i < 100; i++)
  {
    let y = env.lin_value(i/100) * 200;
    vertex(-100 + i * 2, -y);
  }
  endShape();


}
