# Smoothly animating points with regl

> http://rickyreusser.com/smoothly-animating-points-with-regl/

Built with [regl](https://github.com/regl-project/regl/) and inspired by the statement on Peter Beshai's lovely blog post [Smoothly animate thousands of points with HTML5 Canvas and D3](https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3):

> Using this approach with canvas can only get us so far. As you exceed 5,000 points and approach closer to 10,000 it is common to see degradation in performance. If you really need to animate that many points flying around, your best bet is to turn to WebGL and have shaders do the work for you. The regl library provides a nice interface to working with shaders and can be used effectively for this purpose, but that’s a topic for another day!

## To run

```bash
$ npm install
$ npm start
```

## License

&copy; 2017 Ricky Reusser. WTFPL.

As per [the MIT License](https://bl.ocks.org/pbeshai/65420c8d722cdbb0600b276c3adcc6e8#license) on [Peter Beshai's original block](https://bl.ocks.org/pbeshai/65420c8d722cdbb0600b276c3adcc6e8), this repo uses (with gratitude!) the skeleton of the layout functions and is otherwise original code.
