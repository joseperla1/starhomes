(function () {
  function createChat(map, handlers) {
    handlers = handlers || {};

    // --- helpers ---

    function getText(key) {
      if (!(key in map.text)) throw new Error('Missing text key: ' + key);
      return map.text[key];
    }

    function getOutput(id) {
      if (!(id in map.outputs)) throw new Error('Missing output id: ' + id);
      return map.outputs[id];
    }

    function getStep(flow, stepId) {
      if (!(stepId in flow.steps)) throw new Error('Missing step id: ' + stepId);
      return flow.steps[stepId];
    }

    // --- parsers ---

    function parseNumber(raw) {
      if (raw === null || raw === undefined) return null;
      var s = String(raw).replace(/[$,]/g, '').trim();
      var kMatch = s.match(/^(\d+(?:\.\d+)?)k$/i);
      if (kMatch) return parseFloat(kMatch[1]) * 1000;
      var m = s.match(/\d+(?:\.\d+)?/);
      return m ? parseFloat(m[0]) : null;
    }

    function parseBedrooms(raw) {
      if (/studio/i.test(raw)) return 0;
      return parseNumber(raw);
    }

    function parseChoice(raw, options) {
      var lower = String(raw).toLowerCase().trim();
      for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (String(opt.label).toLowerCase() === lower) return opt.value;
        if (String(opt.value).toLowerCase() === lower) return opt.value;
      }
      return undefined;
    }

    function parseStep(step, raw) {
      switch (step.parse) {
        case 'choice':   return parseChoice(raw, step.options);
        case 'number':   return parseNumber(raw);
        case 'bedrooms': return parseBedrooms(raw);
        case 'text':     return String(raw).trim();
        default:         return String(raw).trim();
      }
    }

    // --- prefill ---

    function runPrefill(message) {
      var prefillRules = map.prefill || [];
      for (var i = 0; i < prefillRules.length; i++) {
        var rule = prefillRules[i];
        var val;
        if (rule.parse === 'choice') {
          var lower = message.toLowerCase();
          var found = null;
          for (var slot in rule.match) {
            var keywords = rule.match[slot];
            for (var k = 0; k < keywords.length; k++) {
              if (lower.indexOf(keywords[k]) !== -1) { found = slot; break; }
            }
            if (found) break;
          }
          val = found;
        } else if (rule.parse === 'bedrooms') {
          val = parseBedrooms(message);
        } else {
          val = parseNumber(message);
        }
        if (val !== null && val !== undefined) {
          answers[rule.slot] = val;
        }
      }
    }

    // --- state ---

    var answers = {};
    var fallbackIndex = 0;
    var currentFlow = null;
    var currentStep = null;

    // --- output builder ---

    function buildOptions(outputDef) {
      var keys = outputDef.options || [];
      return keys.map(function (k) {
        if (!(k in map.options)) throw new Error('Missing option key: ' + k);
        return { key: k, label: map.options[k].label };
      });
    }

    function buildResponse(outputDef, listings) {
      var texts = (outputDef.text || []).map(getText);
      var message = texts.join(map.settings.joinWith);
      var then = outputDef.then || null;
      var thenDef = (then && map.outputs[then]) ? map.outputs[then] : null;
      return {
        message: message,
        listings: listings !== undefined ? listings : null,
        followUp: then ? getText(then) : null,
        options: buildOptions(thenDef || outputDef),
        event: outputDef.event || null,
      };
    }

    function callHandler(outputDef) {
      var callName = outputDef.call;
      var fn = handlers[callName];
      var args = Object.assign({}, answers);
      if (outputDef.relaxed) args.relaxed = true;
      var result;
      try {
        result = fn ? fn(args) : [];
      } catch (e) {
        result = [];
      }
      if (!Array.isArray(result)) result = [];
      var nextId = result.length > 0 ? outputDef.onResults : outputDef.onEmpty;
      var nextOutput = getOutput(nextId);
      return buildResponse(nextOutput, result.length > 0 ? result : null);
    }

    // --- flow machinery ---

    function enterFlow(flowId, triggerMessage) {
      var flow = map.flows[flowId];
      if (!flow) throw new Error('Missing flow: ' + flowId);
      currentFlow = flowId;
      currentStep = flow.firstStep;
      if (flow.prefillFromInput && triggerMessage) runPrefill(triggerMessage);
      return advanceFlow();
    }

    function advanceFlow() {
      var flow = map.flows[currentFlow];
      while (currentStep !== null) {
        var step = getStep(flow, currentStep);
        if (answers.hasOwnProperty(step.save)) {
          currentStep = step.next;
          continue;
        }
        return buildStepPrompt(step);
      }
      return completeFlow();
    }

    function buildStepPrompt(step) {
      var options = (step.options || []).map(function (opt, i) {
        return { key: '__step__' + currentFlow + '__' + currentStep + '__' + i, label: opt.label };
      });
      return {
        message: getText(step.ask),
        listings: null,
        followUp: null,
        options: options,
        event: null,
      };
    }

    function completeFlow() {
      var flow = map.flows[currentFlow];
      currentFlow = null;
      currentStep = null;
      var onComplete = flow.onComplete;
      if (onComplete.call) return callHandler(onComplete);
      return buildResponse(onComplete);
    }

    // --- input matching ---

    function checkGlobalInputs(text) {
      var lower = text.toLowerCase();
      var globals = map.globalInputs || [];
      for (var i = 0; i < globals.length; i++) {
        var rule = globals[i];
        for (var k = 0; k < rule.keywords.length; k++) {
          if (lower.indexOf(rule.keywords[k]) !== -1) return rule.output;
        }
      }
      return null;
    }

    function checkInputs(text) {
      var lower = text.toLowerCase();
      var inputs = map.inputs || [];
      for (var i = 0; i < inputs.length; i++) {
        var rule = inputs[i];
        for (var k = 0; k < rule.keywords.length; k++) {
          if (lower.indexOf(rule.keywords[k]) !== -1) return rule.output;
        }
      }
      return null;
    }

    // --- dispatch ---

    function dispatchOutput(outputId, triggerMessage) {
      var outputDef = getOutput(outputId);
      if (outputDef.clearAnswers) answers = {};

      if (outputDef.resumeFlow) {
        currentFlow = outputDef.resumeFlow;
        currentStep = outputDef.atStep;
        return advanceFlow();
      }

      if (outputDef.startFlow) {
        var resp = buildResponse(outputDef);
        var flowResp = enterFlow(outputDef.startFlow, triggerMessage);
        if (resp.message) {
          flowResp = Object.assign({}, flowResp, {
            message: resp.message + map.settings.joinWith + flowResp.message,
          });
        }
        return flowResp;
      }

      if (outputDef.call) return callHandler(outputDef);
      return buildResponse(outputDef);
    }

    // --- step key encoding ---

    function parseStepKey(key) {
      var m = key.match(/^__step__([^_]+(?:_[^_]+)*)__([^_]+(?:_[^_]+)*)__(\d+)$/);
      if (!m) return null;
      return { flowId: m[1], stepId: m[2], index: parseInt(m[3], 10) };
    }

    // --- fallback ---

    function getFallback() {
      var fb = map.fallback || ['fallback1'];
      var idx = Math.min(fallbackIndex, fb.length - 1);
      fallbackIndex++;
      return fb[idx];
    }

    // =====================
    //  PUBLIC API
    // =====================

    function start() {
      fallbackIndex = 0;
      currentFlow = null;
      currentStep = null;
      return dispatchOutput(map.settings.firstOutput, null);
    }

    function send(text) {
      // 1. globalInputs — always first, even mid-flow
      var globalMatch = checkGlobalInputs(text);
      if (globalMatch) {
        fallbackIndex = 0;
        currentFlow = null;
        currentStep = null;
        return dispatchOutput(globalMatch, text);
      }

      // 2. Inside a flow — parse against the current step
      if (currentFlow !== null && currentStep !== null) {
        var flow = map.flows[currentFlow];
        var step = getStep(flow, currentStep);
        var parsed = parseStep(step, text);
        var isParsed = parsed !== undefined && parsed !== null;
        var isOptional = step.optional === true;

        if (!isParsed && !isOptional) {
          return buildStepPrompt(step); // re-ask, no fallback increment
        }

        answers[step.save] = isParsed ? parsed : null;
        currentStep = step.next;
        fallbackIndex = 0;
        return advanceFlow();
      }

      // 3. map.inputs
      var inputMatch = checkInputs(text);
      if (inputMatch) {
        fallbackIndex = 0;
        return dispatchOutput(inputMatch, text);
      }

      // 4. fallback
      return dispatchOutput(getFallback(), text);
    }

    function choose(key) {
      var stepInfo = parseStepKey(key);
      if (stepInfo) {
        if (stepInfo.flowId !== currentFlow || stepInfo.stepId !== currentStep) {
          throw new Error('Stale option key: ' + key);
        }
        var flow = map.flows[currentFlow];
        var step = getStep(flow, currentStep);
        var opt = step.options[stepInfo.index];
        if (!opt) throw new Error('Unknown step option index: ' + stepInfo.index);
        answers[step.save] = opt.value;
        currentStep = step.next;
        fallbackIndex = 0;
        return advanceFlow();
      }

      if (!(key in map.options)) throw new Error('Unknown option key: ' + key);
      fallbackIndex = 0;
      return dispatchOutput(map.options[key].output, null);
    }

    function reset() {
      answers = {};
      fallbackIndex = 0;
      currentFlow = null;
      currentStep = null;
      return start();
    }

    return { start: start, send: send, choose: choose, reset: reset };
  }

  window.StarChat = { createChat: createChat };
})();
