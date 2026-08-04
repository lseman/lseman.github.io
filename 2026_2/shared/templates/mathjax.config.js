
  <script>
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    macros: {
      Re: 'Re',
      Im: 'Im',
      arg: 'arg',
      sinc: 'sinc',
      sgn: 'sgn',
      rect: 'rect',
      tri: 'tri',
      expj: 'expj',
      dB: 'dB',
      SNR: 'SNR',
      EbN0: 'EbN0',
      LPF: 'LPF',
      BPF: 'BPF',
      HPF: 'HPF',
      SSB: 'SSB',
      DSB: 'DSB',
      AM: 'AM',
      FM: 'FM',
      PM: 'PM',
      PSD: 'PSD',
      CDF: 'CDF',
      PDF: 'PDF',
      mean: 'E',
      var: 'Var',
      cov: 'Cov',
      corr: 'Corr',
      jinc: 'jinc',
      unit: 'u',
    },
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  },
  startup: {
    ready: function() {
      MathJax.startup.defaultReady();
    }
  }
};
</script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
