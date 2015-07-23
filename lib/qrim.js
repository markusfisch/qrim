"use strict";

Math.TAU = Math.TAU || Math.PI*2;

function QRIM()
{
	var that = this;

	function drawFadedCircle( ctx, x, y, radius, max )
	{
		for( var r = radius,
				step = max*that.dotMagnifier/(radius-1),
				a = step;
			r-- > 1;
			a += step )
		{
			ctx.globalAlpha = a*that.matrixAlpha;
			ctx.beginPath();
			ctx.arc(
				x,
				y,
				r,
				0,
				Math.TAU,
				false );
			ctx.closePath();
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	function drawCircle( ctx, x, y, radius )
	{
		ctx.beginPath();
		ctx.arc(
			x,
			y,
			radius,
			0,
			Math.TAU,
			false );
		ctx.closePath();
		ctx.fill();
	}

	function drawBlock( ctx, l, t, size )
	{
		var r = Math.round( l+size ),
			b = Math.round( t+size );

		l = Math.round( l );
		t = Math.round( t );

		ctx.fillRect(
			l,
			t,
			r-l,
			b-t );
	}

	function drawShape(
		ctx,
		left,
		top,
		x,
		y,
		blockSize,
		radius,
		center,
		isDark,
		value )
	{
		switch( that.matrixShape )
		{
			case 0:
				drawFadedCircle(
					ctx,
					(left+center+x*blockSize) | 0,
					(top+center+y*blockSize) | 0,
					radius,
					isDark ?
						1/(255-that.blackThreshold)*
							(value-that.blackThreshold) :
						1/that.whiteThreshold*
							(that.whiteThreshold-value) );
				break;
			case 1:
				ctx.globalAlpha = that.matrixAlpha;
				drawCircle(
					ctx,
					(left+center+x*blockSize) | 0,
					(top+center+y*blockSize) | 0,
					radius );
				ctx.globalAlpha = 1;
				break;
			case 2:
				ctx.globalAlpha = that.matrixAlpha;
				drawBlock(
					ctx,
					left+x*blockSize,
					top+y*blockSize,
					blockSize );
				ctx.globalAlpha = 1;
				break;
		}
	}

	function drawQrCode(
		ctx,
		data,
		qr,
		left,
		top,
		blockSize,
		size,
		lx,
		ly )
	{
		var ol = size-10,
			or = ol+6,
			ot = size-10,
			ob = ot+6,
			center = Math.round( blockSize*.5 ),
			radius = blockSize*.5 | 0,
			offset = 0;

		for( var y = 0; y < size; ++y )
			for( var x = 0; x < size; ++x )
			{
				var r = data[offset++],
					g = data[offset++],
					b = data[offset++],
					a = data[offset++],
					value = (r+g+g+b)/4,
					isDark = qr.isDark( y, x );

				ctx.fillStyle = isDark ? "#000" : "#fff";

				// use blocks for eyes and orientation marker
				if( (x < 8 && y < 8) ||
					(x < 8 && y > ly) ||
					(x > lx && y < 8) ||
					(x > ol && x < or && y > ot && y < ob) )
				{
					ctx.globalAlpha = that.eyeAlpha;
					drawBlock(
						ctx,
						left+x*blockSize,
						top+y*blockSize,
						blockSize );
					ctx.globalAlpha = 1;
				}
				else
				{
					if( (!isDark && value > that.whiteThreshold) ||
						(isDark && value < that.blackThreshold) )
						continue;

					drawShape(
						ctx,
						left,
						top,
						x,
						y,
						blockSize,
						radius,
						center,
						isDark,
						value );
				}
			}
	}

	function drawQuiteZoneAroundEyes(
		ctx,
		frame,
		blockSize,
		size,
		lx,
		ly )
	{
		ctx.globalAlpha = that.eyeAlpha;
		ctx.fillStyle = "#fff";

		// vertical padding
		var e = frame.left+blockSize*size;

		for( var y = -1; y <= size; ++y )
			if( y < 8 || y > ly )
			{
				drawBlock(
					ctx,
					frame.left-blockSize,
					frame.top+y*blockSize,
					blockSize );

				if( y < 8 )
					drawBlock(
						ctx,
						e,
						frame.top+y*blockSize,
						blockSize );
			}

		// horizontal padding
		var e = frame.top+blockSize*size;

		for( var x = 0; x < size; ++x )
			if( x < 8 || x > lx )
			{
				drawBlock(
					ctx,
					frame.left+x*blockSize,
					frame.top-blockSize,
					blockSize );

				if( x < 8 )
					drawBlock(
						ctx,
						frame.left+x*blockSize,
						e,
						blockSize );
			}

		ctx.globalAlpha = 1;
	}

	function cut( image, l, t, r, b, w, h )
	{
		var c = document.createElement( "canvas" ),
			x = c.getContext( "2d" );

		w = w || (r-l);
		h = h || (b-t);

		c.width = w;
		c.height = h;

		x.drawImage(
			image,
			l,
			t,
			r-l,
			b-t,
			0,
			0,
			w,
			h );

		return c;
	}

	function unpack( image, w, h )
	{
		var c = document.createElement( "canvas" ),
			x = c.getContext( "2d" );

		w = w || image.width;
		h = h || image.height;

		c.width = w;
		c.height = h;

		x.drawImage(
			image,
			0,
			0,
			image.width,
			image.height,
			0,
			0,
			w,
			h );

		return x.getImageData( 0, 0, w, h ).data;
	}

	function centerInside( width, height, childWidth, childHeight )
	{
		var w, h;

		if( width*childHeight > height*childWidth )
		{
			w = childWidth*height/childHeight;
			h = height;
		}
		else
		{
			h = childHeight*width/childWidth;
			w = width;
		}

		return {
			left: w < width ? (width-w) >> 1 : 0,
			top: h < height ? (height-h) >> 1 : 0,
			width: w,
			height: h };
	}

	function draw( canvas, image, qr )
	{
		var ctx = canvas.getContext( "2d" ),
			w = image.naturalWidth,
			h = image.naturalHeight;

		canvas.width = w;
		canvas.height = h;

		ctx.drawImage( image, 0, 0 );

		var size = qr.getModuleCount(),
			min = Math.min( w, h ),
			frame = centerInside( w, h, min, min ),
			padding = min*.075 | 0,
			insetFrame = {
				left: frame.left+padding,
				top: frame.top+padding,
				right: frame.left+(frame.width-padding),
				bottom: frame.top+(frame.height-padding) },
			blockSize = (Math.min(
				frame.width,
				frame.height )-padding*2)/size,
			lx = size-9,
			ly = size-9;

		drawQuiteZoneAroundEyes(
			ctx,
			insetFrame,
			blockSize,
			size,
			lx,
			ly );

		drawQrCode(
			ctx,
			unpack( cut(
				image,
				insetFrame.left,
				insetFrame.top,
				insetFrame.right,
				insetFrame.bottom,
				size,
				size ) ),
			qr,
			insetFrame.left,
			insetFrame.top,
			blockSize,
			size,
			lx,
			ly );
	}

	function drawText( canvas, image, text )
	{
		// type number 6 and error level H is 64 characters maximum
		var qr = new QRCode( 6, QRErrorCorrectLevel.H );

		qr.addData( text.substr( 0, 64 ) );
		qr.make();

		draw( canvas, image, qr );
	}

	// public properties
	this.dotMagnifier = 1.3;
	this.eyeAlpha = .7;
	this.matrixAlpha = .7;
	this.matrixShape = 0;
	this.whiteThreshold = 220;
	this.blackThreshold = 20;

	// public functions
	this.draw = draw;
	this.drawText = drawText;
}
