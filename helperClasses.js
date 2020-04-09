


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

class NoiseGen
{

  sampleVector;
  sampleCenter;
  sampleOffset;
  sampleInc; //move the noise by this vector
  sampleHeading;

  noiseAmp;

  constructor()
  {

    this.sampleCenter = createVector(random(0,99999), random(0,99999)); //start in a random position
    this.sampleVector = createVector(10,0);
    this.sampleOffset = p5.Vector.div(this.sampleVector, -2); // to draw the sample from the center
    this.sampleHeading = createVector(1,1);
    this.sampleInc = 0.05;
    this.noiseAmp = 50;

  }

  update()
  {
     this.sampleCenter.add(p5.Vector.mult(this.sampleHeading, this.sampleInc));
  }

  value(progress)
  {
    let np  = p5.Vector.mult(this.sampleVector, progress);
    np.add(this.sampleOffset); //set from the center

    let noiseVal = noise(
      this.sampleCenter.x + np.x,
      this.sampleCenter.y + np.y
    );

    let v = map(noiseVal,0.0,1.0,-this.noiseAmp, this.noiseAmp);

    return v;
  }

  setSampleTheta(theta)
  {
    let mag = this.sampleVector.mag();
    this.sampleVector.x = sin(theta);
    this.sampleVector.y = cos(theta);
    this.setSampleMagnitude(mag);
  }

  setSampleMagnitude(mag)
  {
    //println(mag);
    if(mag > 0)
    {
     this.sampleVector.setMag(mag);
     this.sampleOffset = p5.Vector.div(this.sampleVector, -2); // to draw the sample from the center
    }
  }

  setSampleHeading(theta)
  {
    //println(theta);
    this.sampleHeading.x = sin(theta);
    this.sampleHeading.y = cos(theta);
  }

  setSampleInc(inc)
  {
    this.sampleInc = inc;
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

class Toggle
{
  upper_threshold;
  lower_threshold;
  z;
  a;
  b;
  isActive;
  toggle;

  constructor()
  {
    this.upper_threshold = 0.008 ;
    this.lower_threshold = 0.005;
    this.a = 0.95;
    this.b = 1 - this.a;
    this.z = 0;
    this.isActive = false;
    this.toggle = false;
  }

  process(input)
  {
    this.z = input * this.a + this.z * this.b; //debouncing with a onepole

    if(this.z > this.upper_threshold && !this.isActive)
    {
        this.toggle = !this.toggle;
        this.isActive = true;
    }
    else if(this.z < this.lower_threshold && this.isActive)
    {
      this.isActive = false;
    }

  }

}

class OnePole
{

  z;
  a;
  b;
  sampleRate;
  time;
  targetVal;

  constructor(time,sampleRate=60)
  {
    this.sampleRate = sampleRate;
    this.setTime(time);
    this.z = 0;
    this.targetVal = 0;
  }

  process()
  {
    if(this.targetVal == this.z)
    {
      return
    }
    else
    {
      this.z = this.targetVal * this.a + this.z * this.b;
    }
  }

  setTime(time)
  {
    this.time = time;
    this.b = Math.exp(-1.0/(this.time * this.sampleRate));
    this.a = 1.0 - this.b;

  }

  reset()
  {
    this.setTime(this.time);
    this.z = 0.0;
  }

}

class OnePole2
{

  z;
  a_att;
  b_att;
  a_dec;
  b_dec;
  sampleRate;
  attTime;
  decTime;
  targetVal;

  constructor(att,dec, sampleRate=60)
  {
    this.sampleRate = sampleRate;
    this.setAttDec(att,dec);
    this.z = 0;
    this.targetVal = 0;
  }

  process()
  {
    if(this.targetVal == this.z)
    {
      return
    }
    else if(this.targetVal < this.z)
    {
      this.z = this.targetVal * this.a_dec + this.z * this.b_dec;
    }
    else
    {
      this.z = this.targetVal * this.a_att + this.z * this.b_att;
    }
  }

  setAttDec(attTime, decTime)
  {
    this.attTime = attTime;
    this.decTime = decTime;
    this.b_att = Math.exp(-1.0/(attTime * this.sampleRate));
    this.a_att = 1.0 - this.b_att;
    this.b_dec = Math.exp(-1.0/(decTime * this.sampleRate));
    this.a_dec = 1.0 - this.b_dec;
  }

  reset()
  {
    this.setAttDel(this.attTime, this.decTime);
    this.z = 0.0;
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

function calcLinEnv(numPoints, values, durations, interpolation)
{
    //values is an array
    //durations is an array of one less length than values

    let d = [];
    normaliseSum(durations);
    normalise(values); // make sure we're dealing with 0 - 1 values

    for(let i = 0; i < durations.length; i++)
    {
      durations[i] *= numPoints;
      for(let j = 0; j < durations[i]; j++)
      {
        let t = j/durations[i];
        let va = values[i];
        let vb = values[i+1];
        let v = lerp(va,vb,t);

        let i_type = (Array.isArray(interpolation)) ? interpolation[i] : interpolation;

        if(typeof(i_type) == "number")
        {
          v = pow(v,i_type);
        }
        else if(i_type == "sine")
        {

        }

        d.push(v);
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
