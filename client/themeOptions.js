module.exports = [
  {
    'name': 'Metadata',
    'options': [
      {
        'name': 'name',
        'type': 'text',
        'help': 'The name of the theme.'
      }
    ]
  },
  {
    'name': 'Movie',
    'options': [
      {
        'name': 'width',
        'type': 'number',
        'help': 'Desired video width in pixels.'
      },
      {
        'name': 'height',
        'type': 'number',
        'help': 'Desired video height in pixels.'
      },
      {
        'name': 'framesPerSecond',
        'type': 'number',
        'help': 'Desired video framerate.'
      },
      {
        'name': 'samplesPerFrame',
        'type': 'number',
        'help': 'How many data points to use for the waveform. More points = a more detailed wave. (e.g. 128)'
      },
      {
        'name': 'maxDuration',
        'type': 'number',
        'help': 'Maximum duration of an audiogram, in seconds (e.g. set this to 30 to enforce a 30-second time limit).'
      }
    ]
  },
  {
    'name': 'Background',
    'note': 'You can set both a Background Color and a Background Image, in which case the image will be drawn on top of the color.',
    'options': [
      {
        'name': 'backgroundImage',
        'type': 'select',
        'help': 'What image to put in the background of every frame, it should be a file in settings/backgrounds/',
        'options': []
      },
      {
        'name': 'backgroundColor',
        'type': 'color',
        'help': 'A CSS color to fill the background of every frame (e.g. pink or #ff00ff).'
      }
    ]
  },
  {
    'name': 'Caption',
    'note': 'If both Caption Top and Caption Bottom are set, the caption will be roughly vertically centered between them, give or take a few pixels depending on the font.',
    'options': [
      {
        'name': 'captionColor',
        'type': 'color',
        'help': 'A CSS color, what color the text should be (e.g. red or #ffcc00).'
      },
      {
        'name': 'captionAlign',
        'type': 'select',
        'help': 'Text alignment of the caption.',
        'options': [
          'left',
          'right',
          'center'
        ]
      },
      {
        'name': 'captionFont',
        'type': 'text',
        'help': 'A full CSS font definition to use for the caption. ([weight] size \'family\').'
      },
      {
        'name': 'captionLineHeight',
        'type': 'number',
        'help': 'How tall each caption line is in pixels. You\'ll want to adjust this for whatever font and font size you\'re using.'
      },
      {
        'name': 'captionLineSpacing',
        'type': 'number',
        'help': 'How many extra pixels to put between caption lines. You\'ll want to adjust this for whatever font and font size you\'re using.'
      },
      {
        'name': 'captionLeft',
        'type': 'number',
        'help': 'How many pixels from the left edge to place the caption'
      },
      {
        'name': 'captionRight',
        'type': 'number',
        'help': 'How many pixels from the right edge to place the caption'
      },
      {
        'name': 'captionBottom',
        'type': 'number',
        'help': 'How many pixels from the bottom edge to place the caption.'
      },
      {
        'name': 'captionTop',
        'type': 'number',
        'help': 'How many pixels from the top edge to place the caption.'
      }
    ]
  },
  {
    'name': 'Wave',
    'options': [
      {
        'name': 'pattern',
        'type': 'select',
        'help': 'What waveform shape to draw.',
        'options': [
          'wave',
          'bars',
          'line',
          'curve',
          'roundBars',
          'pixel',
          'bricks',
          'equalizer'
        ]
      },
      {
        'name': 'waveTop',
        'type': 'number',
        'help': 'How many pixels from the top edge to start the waveform.'
      },
      {
        'name': 'waveBottom',
        'type': 'number',
        'help': 'How many pixels from the top edge to end the waveform.'
      },
      {
        'name': 'waveLeft',
        'type': 'number',
        'help': 'How many pixels from the left edge to start the waveform.'
      },
      {
        'name': 'waveRight',
        'type': 'number',
        'help': 'How many pixels from the right edge to start the waveform.'
      },
      {
        'name': 'waveColor',
        'type': 'color',
        'help': 'A CSS color, what color the wave should be.'
      }
    ]
  }
];
