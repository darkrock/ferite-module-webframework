<?xml version="1.0" encoding="us-ascii"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
	exclude-result-prefixes="html"
	xmlns:html="http://www.w3.org/1999/xhtml">

<!-- This stylesheet is essentially the identity transformation, with an
	output method of HTML. The intent is to transform XHTML documents
	into HTML ones.
	
	If you're using libxslt, then:

		xsltproc de-xhtml.xsl input.xhtml >output.html
	
	will perform the conversion.
	-->
<!-- ctr: This has been changed because strict is too strict
<xsl:output method="html" encoding="UTF-8" standalone="yes"
	indent="no"
	doctype-public="-//W3C//DTD HTML 4.01//EN"
	doctype-system="http://www.w3.org/TR/html4/strict.dtd" />
-->

<xsl:output method="html" encoding="UTF-8" standalone="yes"
	indent="no"
	doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />
	
<xsl:template match="/html:html" xml:space='preserve'>
<html><xsl:apply-templates select="@*|node()" /></html></xsl:template>

<!-- Only pass through elements in the XHTML namespace -->
<xsl:template match="html:*">
<xsl:element name="{local-name(.)}">
 <xsl:apply-templates select="@*|node()" />
</xsl:element>
</xsl:template>

<!-- Retain 'xml:lang' as plain 'lang' -->
<xsl:template match="@xml:lang">
<xsl:attribute name="lang"><xsl:value-of select="." /></xsl:attribute>
</xsl:template>

<!-- Intentionally don't match processing-instruction() -->
<xsl:template match="@*|text()|comment()">
<xsl:copy>
 <xsl:apply-templates select="@*|node()" />
</xsl:copy>
</xsl:template>

<!-- These rules will keep the 'valid' buttons up to date -->

<xsl:template match="html:img/@alt[.='Valid XHTML 1.0!']">
<xsl:attribute name="alt">Valid HTML 4.01!</xsl:attribute>
</xsl:template>

<xsl:template match="html:img/@src[.='http://www.w3.org/Icons/valid-xhtml10']">
<xsl:attribute name="src">http://www.w3.org/Icons/valid-html401</xsl:attribute>
</xsl:template>

</xsl:stylesheet>
