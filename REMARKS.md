# Remarks

## The bad: "Choice of strategy"

I had never actually worked with data of this variety or magnitude, so I was
initially a bit overwhelmed with the metadata files and their correspondence
to the fields within the GeoJSON, though that subsided after a few hours of
careful observation.

I think I tend to be somewhat systems-minded, and so the first idea that came 
to my mind was to work on a general interface for viewing all this data in a
non-specific manner; that is, no hand-programmed specialized views for 
correlational data, but instead making simpler views for every layer I was
given and making their display deeply configurable, so that I could use my own
user interface to visually identify possible trends and then perhaps make those
views presets in what I would present to the user.

What ended up happening was that I spent far too much time ensuring all fields
were preserved and in a nice format (to help with generality) and I didn't have
time to actually make any one meaningful view look as nice as it could, nor 
craft an attractive interface for it.

That being said, I do not think this is a mistake I would continue to make
on other projects of this sort (and I do hope I get that opportunity!).

## The good: What I learned

GIS is not as intimidating as it initially seemed. The fact that JavaScript can
handle this sort of thing client-side is quite impressive to me. I had seen
some geospatial data overlain on a map in the browser, but never would have
guessed it could be done by the browser itself with as few problems as I
encountered. Prior to this, I assumed it was mostly, if not entirely server-
rendered tiles that were on most websites.

SVG is fun to work with, but it would be best to leave manipulation thereof
to D3 in interest of efficiency.

My biggest takeaway is that these projects will require much more 
individualized thought than I was giving to this one in order to better
elucidate useful data-driven inferences for the communities represented by
them.
