import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './InvoiceStyles'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateHelpers'

export default function InvoiceDocument({ invoice, userEmail, profile = {} }) {
  const { invoiceNumber, status, clientSnapshot, issueDate, dueDate, lineItems = [],
    taxRate, discount, subtotal, discountAmount, taxAmount, total,
    currency = 'USD', notes, paymentTerms } = invoice

  const fmt = (n) => formatCurrency(n, currency)
  const bizName = profile?.businessName || 'Bill Receipt'
  const bizEmail = profile?.email || userEmail || ''
  const bizAddress = profile?.address || ''
  const bizPhone = profile?.phone || ''

  return (
    <Document title={`BillReceipt-${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{bizName}</Text>
            {bizEmail ? <Text style={styles.sellerDetail}>{bizEmail}</Text> : null}
            {bizPhone ? <Text style={styles.sellerDetail}>{bizPhone}</Text> : null}
            {bizAddress ? <Text style={styles.sellerDetail}>{bizAddress}</Text> : null}
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.statusBadge}>{status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.accentLine} />

        {/* Dates + Client */}
        <View style={styles.twoCol}>
          <View style={styles.block}>
            <Text style={styles.blockLabel}>Bill To</Text>
            <Text style={[styles.blockText, { fontFamily: 'Helvetica-Bold' }]}>{clientSnapshot?.name || '—'}</Text>
            {clientSnapshot?.company ? <Text style={styles.blockText}>{clientSnapshot.company}</Text> : null}
            {clientSnapshot?.email ? <Text style={styles.blockText}>{clientSnapshot.email}</Text> : null}
            {clientSnapshot?.address ? <Text style={styles.blockText}>{clientSnapshot.address}</Text> : null}
          </View>
          <View style={[styles.block, { alignItems: 'flex-end' }]}>
            <Text style={styles.blockLabel}>Invoice Details</Text>
            <Text style={styles.blockText}>Issue Date: {formatDate(issueDate)}</Text>
            <Text style={styles.blockText}>Due Date: {formatDate(dueDate)}</Text>
            {paymentTerms ? <Text style={[styles.blockText, { marginTop: 4, color: '#6b7280' }]}>{paymentTerms}</Text> : null}
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.colAmount}>{fmt(item.subtotal ?? item.quantity * item.unitPrice)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmt(subtotal)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount {discount?.type === 'percent' ? `(${discount.value}%)` : '(fixed)'}</Text>
              <Text style={styles.totalsValue}>-{fmt(discountAmount)}</Text>
            </View>
          )}
          {taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.totalsValue}>{fmt(taxAmount)}</Text>
            </View>
          )}
          <View style={[styles.totalsRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 6 }]}>
            <Text style={[styles.totalsLabel, styles.totalsBold]}>Total Due</Text>
            <Text style={[styles.totalsValue, styles.totalsBold]}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by Bill Receipt · Thank you for your business.</Text>
        </View>
      </Page>
    </Document>
  )
}
