import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../2026_2/emc/sim/spice-tlm.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { SpiceNetlistParser, SpiceTLMSimulator } = await import(moduleUrl);

test('parses standard independent-source DC and AC values', () => {
  const netlist = new SpiceNetlistParser().parse(`
V1 in 0 DC 2 AC 3 90
R1 in 0 1k
.ac lin 1 1k 1k
.end`);
  assert.equal(netlist.sources[0].dcValue, 2);
  assert.equal(netlist.sources[0].acMagnitude, 3);
  assert.equal(netlist.sources[0].acPhase, 90);
});

test('preserves a bare DC value when an AC value follows it', () => {
  const netlist = new SpiceNetlistParser().parse(`
V1 in 0 2 AC 3
R1 in 0 1k
.ac lin 1 1k 1k
.end`);
  assert.equal(netlist.sources[0].dcValue, 2);
  assert.equal(netlist.sources[0].acMagnitude, 3);
});

test('DEC and OCT counts mean points per decade and octave', () => {
  const decade = new SpiceTLMSimulator(`
V1 in 0 AC 1
R1 in 0 1k
.ac dec 10 1 1k
.end`).runAC();
  const octave = new SpiceTLMSimulator(`
V1 in 0 AC 1
R1 in 0 1k
.ac oct 4 1 8
.end`).runAC();
  assert.equal(decade.length, 31);
  assert.equal(decade.at(-1).frequency, 1000);
  assert.equal(octave.length, 13);
  assert.equal(octave.at(-1).frequency, 8);
});

test('AC voltage phasor drives an RC low-pass correctly', () => {
  const result = new SpiceTLMSimulator(`
V1 in 0 AC 1
R1 in out 1k
C1 out 0 1u
.ac lin 1 159.154943 159.154943
.end`).runAC()[0].voltages.out;
  assert.ok(Math.abs(result.mag - Math.SQRT1_2) < 1e-8);
  assert.ok(Math.abs(result.phase + 45) < 1e-6);
});

test('AC current phasor is included in the MNA right-hand side', () => {
  const result = new SpiceTLMSimulator(`
I1 0 in AC 1m
R1 in 0 1k
.ac lin 1 1k 1k
.end`).runAC()[0].voltages.in;
  assert.ok(Math.abs(result.real - 1) < 1e-12);
  assert.ok(Math.abs(result.imag) < 1e-12);
});

test('dependent voltage sources participate in small-signal AC', () => {
  const result = new SpiceTLMSimulator(`
V1 in 0 AC 1
E1 out 0 in 0 2
R1 out 0 1k
.ac lin 1 1k 1k
.end`).runAC()[0].voltages.out;
  assert.ok(Math.abs(result.real - 2) < 1e-12);
});

test('transient source is evaluated and recorded at the new time', () => {
  const simulator = new SpiceTLMSimulator(`
V1 out 0 PWL(0 0 1n 1)
R1 out 0 1k
.tran 1n 1n
.probe V(out)
.end`);
  simulator.simulate();
  assert.equal(simulator.time, 1e-9);
  assert.equal(simulator.getProbeData('out')[0].time, 1e-9);
  assert.equal(simulator.getProbeData('out')[0].voltage, 1);
});
