import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class OHLCTooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const {
			accessor,
			ohlcFormat,
			percentFormat,
			displayTexts,
			displayValuesFor,
		} = this.props;

		const { chartConfig: { width, height } } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);

		let open, high, low, close, absolute, percent, textFill = 'grey';
		open = high = low = close = absolute = percent = displayTexts.na;

		if (isDefined(currentItem) && isDefined(accessor(currentItem))) {
			const item = accessor(currentItem);
			open = ohlcFormat(item.open);
			high = ohlcFormat(item.high);
			low = ohlcFormat(item.low);
			close = ohlcFormat(item.close);
			absolute = ohlcFormat(item.absolute)
			percent = percentFormat(item.percent/100);
			textFill = functor(this.props.textFill)(currentItem)
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const itemsToDisplay = {
			open,
			high,
			low,
			close,
			absolute,
			percent,
			textFill,
			x,
			y,
		};
		return this.props.children(this.props, itemsToDisplay);
	}
	render() {
		return (
			<GenericChartComponent
				clip={false}
				svgDraw={this.renderSVG}
				drawOn={["mousemove"]}
			/>
		);
	}
}

OHLCTooltip.propTypes = {
	className: PropTypes.string,
	accessor: PropTypes.func,
	children: PropTypes.func,
	percentFormat: PropTypes.func,
	ohlcFormat: PropTypes.func,
	origin: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	onClick: PropTypes.func,
	displayValuesFor: PropTypes.func,
	textFill: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
	tickerFill: PropTypes.string,
	labelFill: PropTypes.string,
	displayTexts: PropTypes.object,
};

const displayTextsDefault = {
	t: "",
	o: " O",
	h: " H",
	l: " L",
	c: " C",
	v: " Vol",
	na: "n/a"
};

OHLCTooltip.defaultProps = {
	accessor: d => {
		return {
			open: d.open,
			high: d.high,
			low: d.low,
			close: d.close,
			absolute: d.absoluteChange,
			percent: d.percentChange,
		};
	},
	percentFormat: format(".2%"),
	ohlcFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 0],
	children: defaultDisplay,
	displayTexts: displayTextsDefault,
};

function defaultDisplay(props, itemsToDisplay) {

	/* eslint-disable */
	const {
		className,
		tickerFill,
		labelFill,
		onClick,
		fontFamily,
		fontSize,
		displayTexts
	} = props;
	/* eslint-enable */

	const {
		open,
		high,
		low,
		close,
		absolute,
		percent,
		textFill,
		x,
		y,
	} = itemsToDisplay;
	return (
		<g
			className={`react-stockcharts-tooltip-hover ${className}`}
			transform={`translate(${x}, ${y})`}
			onClick={onClick}
		>
			<ToolTipText
				x={0}
				y={0}
				fontFamily={fontFamily}
				fontSize={fontSize}
			>
				<ToolTipTSpanLabel fill={tickerFill} key="label_T">[{displayTexts.t}]</ToolTipTSpanLabel>
				<ToolTipTSpanLabel fill={labelFill} key="label_O">{displayTexts.o}</ToolTipTSpanLabel>
				<tspan key="value_O" fill={textFill}>{open}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_H">{displayTexts.h}</ToolTipTSpanLabel>
				<tspan key="value_H" fill={textFill}>{high}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_L">{displayTexts.l}</ToolTipTSpanLabel>
				<tspan key="value_L" fill={textFill}>{low}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_C">{displayTexts.c}</ToolTipTSpanLabel>
				<tspan key="value_C" fill={textFill}>{close} {signFormat(absolute)} ({signFormat(percent)})</tspan>
			</ToolTipText>
		</g>
	);
}

function signFormat(number) {
	return number.indexOf('-') === -1 ? '＋' + number : number.replace('-', '－')
}

export default OHLCTooltip;
