
class SimpleLine
{

  //a container for vertices - to be extended into other classes

  vertices;

  constructor(_vertices)
  {
    //data should be an array of values
    this.vertices = _vertices;
  }

  calcVertex(progress)
  {
    //progress should be values between 0 and 1
    progress = constrain(progress,0,1);
    var v = progress * this.vertices.length;
    var a = constrain(floor(v), 0, this.vertices.length -1);
    var remainder  = v - a;
    var b = constrain(a + 1, 0, this.vertices.length);

    return p5.Vector.lerp(this.vertices[a], this.vertices[b], remainder);
  }


}

class EnvelopeData
{
  //container for normalised curves for time-based applications
  //TODO: implement other types of interpolation
  data;

  constructor(_data)
  {
    //data should be an array of values
    this.data = _data;
  }

  lin_value(progress)
  {
    //progress should be values between 0 and 1
    progress = constrain(progress,0,1);
    var v = progress * (this.data.length -1);
    var a = constrain(floor(v), 0, this.data.length -1);
    var remainder  = v - a;
    var b = constrain(a + 1, 0, this.data.length -1);

    //linear interpolation only for now
    var l = lerp(this.data[a],this.data[b],remainder);
    return l;
  }


}

////////////////////////////////// HELPER FUNCTIONS ////////////////////////

// Sine curves
function calcSineEnv(numPoints,start,end,mul=1,power=1)
{
  //calculates a portion of a sine function as an envelope

  let d = [];
  let r = end - start;

  for(let i = 0; i < numPoints; i++)
  {
    let v = sin(start + i * r/numPoints) * mul;
    d.push(v*abs(pow(v,power)));
  }

  return d;
}

function calcLinEnv(numPoints, values, durations)
{
    //values is an array
    //durations is an array of one less length than values

    let d = [];
    normaliseSum(durations);

    for(let i = 0; i < durations.length; i++)
    {
      durations[i] *= numPoints;
      for(let j = 0; j < durations[i]; j++)
      {
        let t = j/durations[i];
        let va = values[i];
        let vb = values[i+1];
        d.push(lerp(va,vb,t));
      }

    }

    return d;

}

function calcSplineEnv(numPoints,values,durations)
{
  normaliseSum(durations); // NB. do we want to do this ?

  let xs = [0];
  let total = 0;
  for(let i = 0; i < durations.length; i++)
  {
    total += durations[i];
    xs.push(total);
  }

  let ks = [];

  CSPL.getNaturalKs(xs, values, ks)	// in x values, in y values, out k value

  let d = [];
  let miny = 100;
  let maxy = -100;

  for(let i = 0; i < numPoints; i++)
  {
    let x = i/(numPoints - 1);
    let y = CSPL.evalSpline(x, xs, values, ks);
    d.push(y);


  }

  normalise(d);

  return d;

}


// Bezier curves
function calcBezierVertices(numPoints,controlPoints)
{
  //an arbitrary number of control points
  var d = [];
  for(let i = 0; i < numPoints; i++)
  {
    let t = i/(numPoints-1);

    let derivedVector  = deCasteljau(controlPoints,t);
    d.push(derivedVector);
  }
  return d;
}

function deCasteljau(vectors, t)
{
  //recursive algorithm to crunch bezier control points into a single vector
  let derivedVectors = [];

  for(let i = 0; i < vectors.length -1; i++)
  {
    derivedVectors.push(p5.Vector.lerp(vectors[i],vectors[i+1],t));
  }

  if(derivedVectors.length > 1)
  {
    return deCasteljau(derivedVectors,t);
  }
  else
  {
    return derivedVectors[0];
  }

}

//interpolation

function cubicInterpolate( a0, a1, a2, a3, p)
{

   var t0, t1, t2, t3, psq;

   psq = pow(p,2);
   t0 = a3 - a2 - a0 + a1;
   t1 = a0 - a1 - t0;
   t2 = a2 - a0;
   t3 = a1;

   return ( t0*p*psq + t1*psq + t2*p + t3 );
}



function normaliseSum(data)
{
  let t = 0;
  for(let i = 0; i < data.length; i++)
  {
    t += data[i];
  }

  for(let i = 0; i < data.length; i++)
  {
    data[i]/=t;
  }

  return data;

}

function normalise(data)
{

  let miny = Number.MAX_VALUE;
  let maxy = Number.MIN_VALUE;

  for(let i = 0; i < data.length; i++)
  {
    if(data[i] < miny)
    {
      miny = data[i];
    }

    if(data[i] > maxy)
    {
      maxy = data[i];
    }
  }

  let range = maxy - miny;

  for(let i = 0; i < data.length; i++)
  {
    data[i] /= range;
    data[i] -= miny; //shift back to zero
  }

}

///////////////////////////////////////// JUNK ////////////////////////////////////////////////


//Trying to sample at equal distributions

// let segments = [];
// let y_points = [];
//
// for(let i = 0; i < d.length-1; i++)
// {
//   let t = abs(d[i+1].x - d[i].x);
//   segments.push(t);
// }
//
// segments = normaliseSum(segments);
//
// var curvePoints = [];
//
// for(let i = 0; i < segments.length; i++)
// {
//   segments[i] = floor(segments[i] * numPoints);
//
//   for(let j = 0; j < segments[i]; j++)
//   {
//     curvePoints.push(lerp(d[i].y, d[i+1].y, j/segments[i]));
//   }
// }
// console.log(curvePoints.length);
// return curvePoints;




function calcCubicCurve(numPoints, controlPoints)
{
  //not very useful

  //controlPoints should be a 2D array of coordinates

  let d = [];
  let segments = [];

  for( i = 0; i < controlPoints.length-1; i++)
  {
    let t = (controlPoints[i+1][0] - controlPoints[i][0]);
    segments.push(t);
  }

  normaliseSum(segments);

  for(let i = 0; i < segments.length; i++)
  {
    segments[i] *= numPoints;
    for(let j = 0; j < segments[i]; j++)
    {
      let p = j/segments[i]; //the proportion for interpolation
      d.push(cubicInterpolate(
        controlPoints[max(0,i-1)][1],
        controlPoints[i][1],
        controlPoints[min(controlPoints.length-1, i+1)][1],
        controlPoints[min(controlPoints.length-1,i+2)][1],
        p));
    }
  }

  return d;

}
