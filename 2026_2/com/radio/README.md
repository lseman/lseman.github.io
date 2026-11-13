# Radio / IoT Lab

Open `radio/` from the course's existing static web server, or follow the links from Wi-Fi Lab and Block Studio. No build step or backend is required. The UI is in Portuguese.

## Guided CRC laboratory

Open [`crc-laboratorio.html`](crc-laboratorio.html), also linked as **Roteiro CRC** in the bench navigation. The Portuguese worksheet guides students through polynomial division, the exact packet/CRC contract, syntax-highlighted C++/Arduino encoder and receiver exercises for the physical laboratory, trace checkpoints, controlled faults, and a report checklist. Students implement the exercises in their hardware projects and validate with serial logs; the HTML is a worksheet rather than a JavaScript editing activity. The worksheet has no backend or build dependencies.

## OLED displays

Each board has its own text-mode OLED (21 columns × 8 rows). Open [the Portuguese OLED tutorial](oled-tutorial.html) from the bench navigation or either display. `oled.clear()` clears the buffer, `oled.setCursor(column, row)` positions in character cells (0–20, 0–7), `oled.print(value)` / `oled.println(value)` write, and `oled.display()` commits the buffer. Text wraps at 21 characters and clips after row eight. Calls accept up to 1024 characters. This is a text teaching model, not pixel/I²C/SSD1306 emulation. The tutorial separately provides a C++/Arduino SSD1306 hardware example.

Displays update after successful setup/loop responses, persist between cycles, and clear on session reset or fresh firmware load. Stop retains the last image. Replay does not change A's screen because A's loop does not execute. OLED state crosses the worker boundary as an eight-line text snapshot, independent of CRC reports and delivery decisions. Starter firmware only contains OLED hints; CRC and radio TODOs remain unfinished.

## First lesson

1. Implement the TODOs in both board editors first. The initial and restored programs are student skeletons: A sends nothing and B rejects received frames until implemented. Then leave BPSK, 10 m, and a clear path selected. Click **1 ciclo A → B**. Firmware A builds the packet and firmware B validates it.
2. Inspect the two serial monitors, TX/RX bytes, and CRC result.
3. Select a byte or move the symbol slider to inspect its waveform and decision.
4. Lower Eb/N₀ and transmit again. Use **Repetir pacote** to compare the same packet under changed controls, retaining the seed for the same random noise realization.
5. Compare OOK, FSK, BPSK, QPSK, 16-QAM, and the educational LoRa/CSS mode. Export attempts as CSV for analysis. **Limpar sessão de medições** clears the session measurements and sequence counter.

## Bench interface

The workspace places configuration beside two full-width firmware editors, the measurement rack, link diagram, oscilloscope, receiver display, and packet analyzer. Serial monitors and the latest eight measurement rows appear below the instruments; CSV exports the complete session.

- **1 ciclo A → B** executes the two firmware loops once; **Ctrl/⌘ + Enter** is the keyboard shortcut.
- **Repetir** preserves the latest payload and sequence number and applies current radio/channel settings.
- **AJUSTES PENDENTES** means controls or firmware changed after capture. Instruments and measurements keep the latest acquisition until the next successful run; its configuration remains visible in the acquisition caption.
- Previous/next buttons and the symbol slider navigate receiver decisions. Clicking a byte selects its first overlapping symbol.
- SYNC, LEN, and CRC show checks returned by the editable B firmware. Missing checks are shown as “—”. An independent reference result is displayed in the CRC inspector and never overrides B’s delivery decision. A failed packet remains inspectable.
- Two editable firmware panels contain unfinished `setup()` / `loop()` programs and CRC TODOs. **Reiniciar A/B** restores the unfinished skeleton; **Ver CRC** jumps to the function to implement.
- Dark/light theme is remembered locally when browser storage is available; waveforms and measurement history are retained only in memory. Reset stops/disposes both boards and clears history, packet checks, traces, consoles, and acquisition state. The next cycle reloads the firmware, so its counters restart.
- The experiment session stores only the latest full signal result; historical rows contain scalar measurements. Failed simulation attempts do not advance sequence numbers or counters.

## LoRa lesson

Select **05 · LoRa: do chirp ao bit**, then transmit. SF7–SF12 and bandwidths of 125, 250, and 500 kHz are available. Bitrate is derived from SF and BW; leaving LoRa restores the previous manual bitrate.

- Inspect the transmitted/received I waveform, ideal instantaneous chirp frequency, dechirped tone, and received FFT power.
- The expected FFT bin is green; the detected bin is circled in white. Move the symbol slider to see how each binary symbol changes the chirp and peak. Byte selection highlights all bytes overlapping the selected symbol.
- Compare SF7 and SF12 with fixed BW. Then double BW. Check symbol duration, raw bitrate, and educational airtime.
- Lower Eb/N₀ or add distance/obstacle loss until FFT peak decisions become incorrect and CRC rejects the packet.
- CSV includes SF, bandwidth, raw bitrate, SNR in BW, padding bits, BER, delivery, and airtime for each attempt.

This is an uncoded LoRa-inspired CSS teaching mode, not an interoperable LoRa modem. It uses the existing CommsLab packet format. Airtime is for that teaching packet, not the Semtech LoRa PHY or LoRaWAN. No coding-rate selector is offered because FEC is not modeled.

## Waveform views

- Linear/FSK modes default to a teaching carrier with 2 cycles per symbol and a 4-symbol window. Switch to I/Q baseband or choose a 1/8-symbol window to inspect amplitude and phase changes. The carrier is illustrative, not the physical RF frequency.
- LoRa defaults to a 16-chip detail window. Select 64 chips or the full chirp; move **Posição no chirp** to inspect another part of the selected symbol. A shaded region on the full-chirp frequency chart marks the current window. The dechirped tone uses the same time window.
- TX curves are evaluated between sample instants, with markers at actual sample positions when the window is short enough. The continuous CSS formula wraps frequency within BW and agrees with the modem at every chip sample. The dechirped tone uses the signed alias of its FFT bin within ±BW/2.
- **Mostrar RX e amostras** overlays the received signal. RX uses normalized, 16-tap Lanczos-windowed sinc interpolation of the original noisy samples, with constant extension at the symbol/packet edge. This is display reconstruction only; detector samples, noise, FFT, CRC and BER are unchanged. RX is initially hidden so the ideal waveform can be studied separately; the legend explicitly indicates this state.
- Plots use normalized amplitude, labeled time axes, and canvas resolution matched to the display pixel ratio. Very long windows naturally contain densely packed cycles; use the detail window to inspect their shape.

## Executable firmware: setup A and setup B

The editors run **synchronous JavaScript with Arduino-style `setup()` and `loop()` functions**, not C++ or an ESP32 emulator. Each board has its own persistent worker and lexical state. Students must implement CRC-16/CCITT-FALSE: initial register `0xFFFF`, polynomial `0x1021`, no reflection and no final XOR. There is no automatic CRC implementation in the editable skeletons. The behavior below describes completed student programs.

1. **Carregar A + B** starts fresh workers and calls each `setup()` once. Setup log messages appear in the two serial monitors. Loading resets board variables, but retains session measurements.
2. **1 ciclo A → B** (or Ctrl/⌘ + Enter) loads the firmware if necessary, then calls A’s `loop()`. A constructs `[AA AA D3 91, sequence, UTF-8 length, payload, CRC high, CRC low]`, calculates its own CRC, calls `radio.send(frame)`, and advances its own sequence variable.
3. The signal model transmits those exact bytes without adding or repairing CRC. Demodulated bytes are passed to B **even when sync, length, or the reference CRC is invalid**.
4. B’s `loop()` consumes the frame with `radio.receive()`, manually recalculates CRC, compares it with the two received bytes, and returns its decision. The UI’s delivery statistics use `report.accepted` from this code. BER still uses simulation ground truth.
5. **Executar loops** repeats cycles without overlap. The next cycle is scheduled after the previous cycle finishes, waiting at least the selected interval and at least the prior packet’s modeled airtime. If A sends nothing, B still runs with `radio.receive() === null`; loop count advances but no packet measurement is added.
6. **Parar**, editing either firmware, restoring an example, leaving the page, or resetting terminates both workers and cancels pending work. The next run reloads the programs and executes setup again. Between ordinary single cycles, variables remain alive.
7. **Repetir** reuses the exact last transmitted bytes and A’s recorded trace without calling A’s loop. It applies current channel settings and calls the current B firmware. If A’s source has changed, the acquisition retains the original A source as provenance and remains marked pending against the edited A source.

### Editor and automatic checks

- Editors show line numbers, the active line, a status bar (line/column and remaining `TODO`s), smart indentation (Tab/Shift+Tab, auto-indent on Enter, `}` dedent) and Ctrl/⌘ + / to toggle comments. Press Esc, then Tab, to move focus out of an editor.
- **A | B** switches between side-by-side and single-board layouts (remembered locally when storage is available). **Ver CRC** reveals the `crc16` function.
- Runtime errors are mapped to the student's source line: the line is highlighted in red and the message appears in the editor status bar.
- **✓ Testar A + B** runs `firmware-selftest.mjs` in throwaway workers, never on the bench boards. It checks `crc16` against reference vectors (empty input, one byte, `"123456789"`, the `"OK"` body, a 122-byte body), A's frame (header, length byte, CRC bytes, sequence increment) and B's decisions on valid and corrupted frames. Rejection checks only count after B accepts a valid frame, so a receiver that rejects everything earns no credit.

### Board interface

- `radio.send(bytes)` — A’s loop only; exactly 8–128 integer bytes, values 0–255; at most one frame per cycle. The supplied format reserves 8 bytes of overhead and allows up to 120 UTF-8 payload bytes.
- `radio.receive()` — B only; returns a `Uint8Array` containing the raw demodulated bytes, then `null` if called again in the same cycle. There is no pre-filtering or automatic payload/CRC parsing.
- `Serial.println(value)` — appends to that board’s serial monitor (up to 60 lines per call; each line up to 600 characters). The UI retains the latest 160 lines per board.
- `traceCRC({byte, bit, before, msb, after})` — records an actual operation from the student’s code. Byte index is relative to the CRC-covered body, bit is 0–7, and registers are unsigned 16-bit values. Up to 2048 operations per call are retained.
- `loop()` may return `null` or a report. B reports require boolean `accepted`. Optional boolean `syncOK`, `lengthOK`, and `crcOK` populate the packet checks. Optional `crcReceived`, `crcCalculated`, and `payload` populate the inspector. A returns `crcCalculated` for its TX readout. Reports are validated and only documented scalar fields cross back to the UI.

Each worker request has a 1.5-second deadline; infinite loops or slow setup terminate the boards and leave the interface usable. One request can be active per board; one full A→channel→B cycle can be active at a time. Stop/edit/reset invalidates in-flight work, so a late worker response cannot add a stale measurement. Setup/loop are synchronous; async functions and promises are rejected. Firmware is student-authored code executing in workers; the worker separation provides DOM isolation and termination, not an ESP32 instruction emulator.

### CRC lesson

- Complete both starter programs, then run two single cycles. Verify `setup()` logs once, A’s sequence increments, and B’s acceptance counter persists.
- Select a board and body byte in **CRC manual**. The eight rows show the register after the input-byte XOR and before each shift, the MSB, the branch taken, and the resulting register. These are the values supplied by `traceCRC()` in that board’s program, not a synthesized reference trace.
- Change `if (msb) crc ^= 0x1021;` to `if (msb) crc ^= 0x8005;` in B only. With a clean channel, BER is zero but B rejects the packet because its recalculated CRC differs.
- Make the same change in A. Both agree and B accepts, while the independent CCITT reference marks the CRC invalid. This separates channel errors, protocol agreement, and conformance to a chosen CRC algorithm.
- Try ignoring `crcOK` in B’s `accepted` expression. The resulting acceptance is visible, alongside the independent failed check; the host does not silently repair that decision.
- **Reiniciar A/B** restores unfinished skeletons independently, erasing student edits.

## Signal model

`firmware-templates.mjs` supplies the unfinished student skeletons. Solved firmware in `tests/fixtures/reference-firmware.mjs` is used only by automated runtime tests and is not imported by the bench. `firmware-engine.mjs` implements their board interface, `firmware-worker.mjs` hosts it off the main thread, and `firmware-runtime.mjs` owns worker requests, deadlines, and disposal. `phy.mjs` owns raw-frame modulation, noise, detection, and independent reference diagnostics; its default packet builder remains available to numerical tests. `lora.mjs` owns CSS generation, dechirping, radix-2 FFT, and SF/BW validation. `waveform.mjs` owns display-only interpolation and continuous waveform evaluation. `session.mjs` owns acquisition sequencing, counters, measurement history, and CSV serialization. `instruments.mjs` owns canvas rendering, waveform controls, byte/symbol navigation, and its event/resize lifecycle. `crc-inspector.mjs` renders the reported manual CRC values and traces. `app.mjs` owns the board lifecycle, serial cycle scheduler, configuration, acquisition readouts, monitors, and theme preference. Everything stays in the browser; no hardware or real RF is accessed.

- Frame: AA AA preamble, D3 91 sync word, one-byte sequence, one-byte UTF-8 payload length, payload, CRC-16/CCITT-FALSE over sequence + length + payload.
- Linear/FSK modes: complex baseband, rectangular pulses, 16 samples per symbol, ideal carrier and symbol timing. Nominal average Es=1; OOK assumes equiprobable bits for energy normalization.
- AWGN variance per real component: 1/(2 k Eb/N₀), where k is bits per symbol. Unit-energy rectangular pulse integration yields coherent symbol decisions.
- BFSK uses two orthogonal complex tones with one cycle of spacing per symbol and coherent correlation. Its scatter plot shows real correlator outputs, not an I/Q constellation.
- QPSK and square 16-QAM use Gray labels. Symbol decisions use nearest Euclidean distance.
- Effective Eb/N₀ = reference Eb/N₀ at 10 m − 20 log10(distance/10 m) − obstacle loss. This is an illustrative relative path-loss model, not a calibrated RF link budget.
- Airtime includes all frame bits. Bandwidth is an illustrative one-sided baseband first-null estimate: Rs for rectangular linear modulation and 2Rb for the BFSK tones used here. It is not an occupied-bandwidth measurement.
- LoRa/CSS: N=2^SF chips per symbol, Fs=BW, Ts=N/BW, raw Rb=SF·BW/N. A unit-energy cyclic upchirp is multiplied by a complex tone for symbol m. Multiplication by the conjugate reference chirp followed by FFT concentrates that symbol in bin m. The receiver selects the largest FFT magnitude, without using a known carrier phase. Direct binary symbol labels are used, not LoRa whitening/interleaving/Gray processing.
- The CSS final symbol is zero-padded to SF bits; padding is excluded from decoded frame bits and BER but included in airtime. Airtime = ceil(frameBits/SF)·Ts. The AA AA/D3 91 fields are teaching packet bytes mapped to chirps, not a real LoRa chirp preamble/sync sequence.
- For CSS, SNR over BW = effective Eb/N₀ + 10 log10(SF/N). Fixed Eb/N₀ while changing SF/BW does **not** hold transmitter power/noise density fixed. Bandwidth changes time/rate, not error performance at identical SF, seed, packet and Eb/N₀. FFT power is normalized to a 0 dB ideal unit-energy symbol peak; it is not dBm.
- Sync is checked at the known frame boundary; there is no acquisition/search receiver. BER uses simulator ground truth even when the receiver discards the packet. No FEC, retries, collision model, energy model, LoRa-specific PHY framing, or LoRaWAN stack is modeled.
- Identical seed, packet and settings reproduce the same received samples. Changing modulation changes sample grouping and noise normalization. The default A firmware increments its sequence byte after sending; replay preserves the exact transmitted bytes. Packet delivery totals include replays and all selected configurations until reset.

## Validation

```sh
node --test radio/tests/*.test.mjs
```

Tests cover clean/noisy reception for all six modes, CRC's standard reference vector, UTF-8 framing, deterministic noise, path loss, airtime, frame boundaries, and BPSK BER at Eb/N₀=0 dB.

LoRa tests additionally cover every SF/BW combination, unit-energy chirps, all SF7 symbols and SF12 boundary bins, FFT power against an independent direct DFT, padding, raw rate/airtime, SNR conversion, deterministic noise, and invalid parameters.

## References

- [Semtech AN1200.22 — LoRa Modulation Basics](https://www.mouser.com/pdfdocs/an120022.pdf): CSS, spreading factor, bandwidth, and symbol duration.
- [OpenLoRa: Validating LoRa Implementations through an Extensible and Open-sourced Framework](https://www.microsoft.com/en-us/research/wp-content/uploads/2023/08/2023_NSDI_OpenLoRa__Validating_LoRa_Implementations_through_an_Extensible_and_Open_sourced_Framework.pdf): dechirp/FFT receiver principle.

Waveform tests verify agreement with modem samples, continuity at chirp frequency wrap, sinc sample preservation and interpolation, window bounds, and teaching-carrier phase/amplitude.

Session tests cover deterministic replay, changed-channel replay, failed-acquisition rollback, sequence wrapping, reset, isolated measurement history, and CSV metadata.

Firmware tests cover the standard CRC check vector, independent setup/loop state, exact raw frames, acceptance determined by B, wrong/matching custom CRCs, deliberate check bypass, raw noisy reception, frame/API limits, bounded logs/traces, invalid code/report handling, and reset cancellation. Browser QA additionally exercises worker timeouts, recovery, continuous run/stop, all modulation modes, CRC navigation, and responsive layout.
