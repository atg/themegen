# Procedural Theme Generator

This is a bit of a work in progress. It's a text editor theme generator built on coffeescript, that works entirely in the browser. 


## FAQs

> What text editors will you support?

I certainly intend to support Vim, Emacs and TextMate. Other text editors are less certain, it depends on how much time I get.

> How is your theme generator better?

Quality and consistency.

If you just generate themes randomly, most of them will suck. It's simple statistics: if there's a 80% chance of one colour looking passable against the background, then there's only a 0.8^5 = 32% chance of a theme with 5 colours having no major faults, and this is without considering interactions with other colours.

This can be mitigated by limiting the range of each variable, so that the themes generated are safer bets. But the more you do that, the less creative the theme generator becomes.

My eventual  solution is to have a function that decides whether a theme sucks or not, and to just keep generating themes until one passes. Combined with that "mitigation", there's a very high chance that the eventual theme generated will be good.


Other than that, it's open source, customisable and completely client-side.
