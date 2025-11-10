import React from 'react'
import { formatDate } from 'date-fns'
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer'
import type { Registration, ChildWithParent } from './schema'
import { pickupLabels } from './schema'
import { Check } from 'lucide-react'

// Create PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  eventInfo: {
    fontSize: 11,
    marginBottom: 15,
    color: '#666',
  },
  summary: {
    fontSize: 10,
    marginBottom: 20,
    color: '#333',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 25,
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tableCol1: {
    width: '5%',
    paddingLeft: 5,
  },
  tableCol2: {
    width: '15%',
    paddingLeft: 5,
  },
  tableCol3: {
    width: '10%',
    paddingLeft: 5,
  },
  tableCol4: {
    width: '10%',
    paddingLeft: 5,
  },
  tableCol5: {
    width: '15%',
    paddingLeft: 5,
  },
  tableCol6: {
    width: '21%',
    paddingLeft: 5,
  },
  tableCol7: {
    width: '21%',
    paddingLeft: 5,
  },
  tableCol8: {
    width: '3%',
    paddingLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'solid',
    borderRadius: 2,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  headerText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 120,
  },
})

// Create Document Component
export const RegistrationsDocument: React.FC<{ registrations: Registration[] }> = ({
  registrations,
}) => {
  // Extract event info from first registration
  const firstReg = registrations[0]
  const eventTitle =
    typeof firstReg?.event === 'object' && firstReg.event !== null
      ? firstReg.event.title || 'Knallbonbon'
      : 'Knallbonbon'
  const eventDate =
    typeof firstReg?.event === 'object' && firstReg.event !== null && firstReg.event.date
      ? formatDate(new Date(firstReg.event.date), 'dd.MM.yyyy HH:mm')
      : ''

  // Flatten all children from all registrations with parent info
  const allChildren: ChildWithParent[] = []
  registrations.forEach((reg) => {
    if (reg.child && reg.child.length > 0) {
      reg.child.forEach((child) => {
        allChildren.push({
          ...child,
          parentName: `${reg.firstName} ${reg.lastName}`,
          parentPhone: reg.phone,
          parentEmail: reg.email,
        })
      })
    }
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Top-right Evangelische Jugend logo */}
        <View style={styles.logoContainer} fixed>
          <Svg viewBox="0 0 309 191">
            <Path
              fill="#005e7e"
              fillRule="nonzero"
              d="M127.012 57.24c-9.672-1.178-22.428.066-22.997.245-1.099.348-19.845 5.684-38.052 10.718 1.63-28.981 13.414-55 13.588-55.652.097-.477-.113-1.592-.19-1.845C77.176 3.813 73.833.804 70.17.135c-3.629-.695-7.823 1.438-10.266 3.208-12.58 23.998-16.427 67.239-16.774 70.825C29.228 77.485 5.156 84.885 5.156 84.885c-10.949 6.523-2.123 20.202 4.953 19.539 2.258-.556 16.076-4.583 32.562-9.03 2.408 58.67 13.924 87.46 21.114 94.88 1.398.467 4.316-2.457 4.485-6.347.178-3.786-5.33-51.234-4.055-94.505 52.77-15.254 53.236-15.486 64.773-20.735 8.952-4.22 14.249-10.317-1.976-11.446"
            />
            <Path
              fill="#95c11f"
              fillRule="nonzero"
              d="M97.57 186.214h-3.948v-16.909c2.508-.07 4.097-.118 4.742-.118 2.583 0 4.644.71 6.159 2.152s2.284 3.358 2.284 5.747c0 6.078-3.079 9.128-9.237 9.128m-.795-14.284v11.541c.522.047 1.068.07 1.664.07 1.59 0 2.83-.543 3.725-1.655.918-1.087 1.365-2.625 1.365-4.611 0-3.618-1.763-5.416-5.314-5.416-.322 0-.82.024-1.44.071M108.734 177.606q0-3.618 2.085-6.101c1.391-1.68 3.229-2.507 5.563-2.507 2.557 0 4.494.756 5.86 2.27 1.34 1.49 2.011 3.618 2.011 6.338s-.695 4.895-2.11 6.503c-1.416 1.585-3.427 2.389-6.01 2.389-2.383 0-4.221-.78-5.487-2.365-1.267-1.584-1.912-3.76-1.912-6.527m3.277 0q0 2.98 1.043 4.612c.72 1.064 1.738 1.608 3.08 1.608 1.564 0 2.78-.52 3.6-1.585.844-1.064 1.242-2.601 1.242-4.635 0-3.95-1.54-5.936-4.594-5.936-1.416 0-2.483.52-3.253 1.608q-1.118 1.596-1.118 4.328M126.193 185.268l1.167-2.672c1.242.828 2.459 1.23 3.675 1.23 1.838 0 2.782-.615 2.782-1.845 0-.568-.224-1.111-.67-1.655-.423-.52-1.317-1.088-2.683-1.75-1.365-.663-2.284-1.183-2.756-1.609a4.4 4.4 0 0 1-1.093-1.49 4.9 4.9 0 0 1-.372-1.915q0-1.95 1.49-3.264c1.018-.85 2.31-1.3 3.874-1.3 2.06 0 3.575.378 4.519 1.111l-.944 2.578q-1.676-1.135-3.5-1.135c-.746 0-1.292.189-1.69.567-.397.355-.62.828-.62 1.42 0 .969 1.142 1.986 3.402 3.026 1.192.544 2.036 1.065 2.557 1.514a5.3 5.3 0 0 1 1.217 1.632c.273.638.397 1.324.397 2.08 0 1.373-.57 2.508-1.688 3.383-1.142.875-2.657 1.324-4.57 1.324-1.663 0-3.153-.402-4.494-1.23M138.888 185.268l1.167-2.672c1.242.828 2.458 1.23 3.675 1.23 1.838 0 2.781-.615 2.781-1.845 0-.568-.223-1.111-.67-1.655-.422-.52-1.316-1.088-2.682-1.75-1.366-.663-2.284-1.183-2.756-1.609a4.4 4.4 0 0 1-1.093-1.49 4.9 4.9 0 0 1-.372-1.915q0-1.95 1.49-3.264c1.018-.85 2.309-1.3 3.873-1.3 2.061 0 3.576.378 4.52 1.111l-.944 2.578q-1.675-1.135-3.501-1.135c-.745 0-1.291.189-1.689.567-.397.355-.62.828-.62 1.42 0 .969 1.142 1.986 3.401 3.026 1.192.544 2.037 1.065 2.558 1.514a5.3 5.3 0 0 1 1.217 1.632c.273.638.397 1.324.397 2.08 0 1.373-.571 2.508-1.688 3.383-1.143.875-2.657 1.324-4.57 1.324-1.663 0-3.153-.402-4.494-1.23M155.58 171.954v3.973h5.885v2.554h-5.885v5.06h8.046v2.673h-11.2v-16.909h11.349v2.649zM178.198 186.45l-8.616-10.712v10.476h-3.03v-16.909h1.515l8.393 10.193v-10.193h3.03v17.146zM193.357 186.214V178.6h-7.077v7.615h-3.153v-16.909h3.153v6.622h7.077v-6.622h3.104v16.91zM203.255 171.954v3.973h5.885v2.554h-5.885v5.06h8.045v2.673h-11.199v-16.909h11.348v2.649zM214.301 169.305h3.154v16.91H214.3zM237.7 186.214h-3.054l-1.837-9.105-3.576 9.342h-1.118l-3.6-9.342-1.912 9.105h-3.03l3.576-16.909h1.664l3.849 11.399 3.75-11.399h1.663z"
            />
            <Path
              fill="#005e7e"
              fillRule="nonzero"
              d="M96.775 116.378v3.973h5.885v2.554h-5.885v5.061h8.045v2.673H93.621v-16.91h11.348v2.65zM114.377 130.875h-1.738l-6.655-17.145h3.476l4.122 11.422 4.32-11.422h3.403zM131.718 130.639l-1.316-3.43h-6.084l-1.216 3.43h-3.526l7.101-17.146h1.366l7.152 17.146zm-4.37-11.967-2.136 6.244h4.271zM148.71 130.875l-8.616-10.713v10.477h-3.03v-16.91h1.515l8.393 10.193V113.73h3.03v17.145zM166.775 115.101l-1.341 2.412c-.372-.33-.944-.638-1.713-.946s-1.44-.473-2.012-.473c-1.738 0-3.104.568-4.122 1.703-1.018 1.112-1.515 2.625-1.515 4.517 0 1.821.497 3.24 1.49 4.328.994 1.088 2.335 1.608 4.048 1.608 1.117 0 2.036-.284 2.756-.875v-3.31h-2.458v-2.579h5.612v7.592c-.745.567-1.714 1.04-2.905 1.348a13 13 0 0 1-3.527.496c-2.532 0-4.569-.78-6.058-2.388-1.49-1.585-2.235-3.69-2.235-6.29 0-2.602.82-4.73 2.433-6.362 1.64-1.632 3.824-2.46 6.556-2.46 1.961 0 3.625.568 4.99 1.68M173.464 116.378v3.973h5.885v2.554h-5.885v5.061h8.046v2.673h-11.2v-16.91h11.349v2.65zM184.436 130.639v-16.91h3.153v14.237h8.02v2.673zM198.236 113.73h3.153v16.909h-3.153zM204.228 129.693l1.167-2.673c1.242.828 2.459 1.23 3.675 1.23 1.838 0 2.782-.615 2.782-1.845 0-.567-.224-1.111-.67-1.655-.423-.52-1.317-1.088-2.683-1.75s-2.284-1.182-2.756-1.608a4.4 4.4 0 0 1-1.093-1.49 4.9 4.9 0 0 1-.372-1.916q0-1.95 1.49-3.263c1.018-.852 2.31-1.3 3.874-1.3 2.06 0 3.575.378 4.519 1.11l-.944 2.578q-1.675-1.135-3.501-1.135c-.745 0-1.291.19-1.689.568-.397.355-.62.828-.62 1.419 0 .97 1.142 1.986 3.402 3.027 1.192.544 2.036 1.064 2.557 1.513a5.3 5.3 0 0 1 1.217 1.632c.273.639.397 1.325.397 2.081 0 1.372-.57 2.507-1.688 3.382-1.142.875-2.657 1.324-4.57 1.324-1.663 0-3.153-.402-4.494-1.23M229.934 114.628l-1.291 2.483c-.696-.685-1.838-1.017-3.377-1.017q-2.235 0-3.65 1.774c-.944 1.183-1.416 2.673-1.416 4.493 0 1.798.447 3.24 1.316 4.305.87 1.064 2.036 1.584 3.501 1.584 1.689 0 2.98-.567 3.924-1.703l1.49 2.436c-1.292 1.3-3.179 1.94-5.662 1.94s-4.42-.781-5.786-2.318c-1.365-1.561-2.06-3.69-2.06-6.362 0-2.507.77-4.611 2.284-6.29 1.515-1.68 3.476-2.53 5.86-2.53 2.036 0 3.65.401 4.867 1.205M243.19 130.639v-7.615h-7.077v7.615h-3.154v-16.91h3.154v6.622h7.077v-6.621h3.104v16.909zM253.087 116.378v3.973h5.885v2.554h-5.885v5.061h8.046v2.673h-11.2v-16.91h11.349v2.65zM103.703 159.092l-4.941-7.213-1.987 2.578v4.635h-3.153v-16.91h3.153v8.089l6.034-8.088h3.6l-5.561 7.378 6.63 9.531zM109.022 142.183h3.154v16.909h-3.154zM125.89 159.092l-4.743-6.976c-.496-.024-1.142-.048-2.01-.095v7.071h-3.279v-16.91c.174 0 .87-.046 2.061-.094 1.192-.047 2.136-.094 2.856-.094 4.52 0 6.779 1.679 6.779 4.99 0 1.017-.323 1.915-.944 2.743a5.07 5.07 0 0 1-2.334 1.75l5.24 7.615zm-6.754-14.308v4.706c.596.048 1.018.071 1.341.071 1.316 0 2.285-.189 2.88-.544.621-.354.92-1.04.92-2.057 0-.828-.324-1.419-.97-1.75-.67-.331-1.688-.497-3.103-.497-.348 0-.695.024-1.068.071M143.194 143.082l-1.291 2.483c-.696-.686-1.838-1.017-3.377-1.017q-2.235 0-3.65 1.773c-.944 1.183-1.416 2.673-1.416 4.494 0 1.797.447 3.24 1.316 4.304s2.036 1.584 3.501 1.584c1.689 0 2.98-.567 3.924-1.702l1.49 2.436c-1.292 1.3-3.179 1.939-5.662 1.939s-4.42-.78-5.786-2.318c-1.366-1.56-2.06-3.69-2.06-6.361 0-2.507.769-4.612 2.284-6.291s3.476-2.53 5.86-2.53c2.036 0 3.65.401 4.867 1.206M156.45 159.092v-7.615h-7.078v7.615h-3.153v-16.91h3.153v6.623h7.077v-6.622h3.104v16.909zM166.347 144.832v3.973h5.885v2.554h-5.885v5.06h8.046v2.673h-11.2v-16.91h11.349v2.65zM188.965 159.328l-8.617-10.713v10.477h-3.03v-16.91h1.515l8.393 10.194v-10.193h3.03v17.145zM207.03 143.555l-1.342 2.412c-.372-.331-.943-.639-1.713-.946-.77-.308-1.44-.473-2.011-.473-1.739 0-3.104.567-4.122 1.703-1.019 1.111-1.515 2.625-1.515 4.517 0 1.82.496 3.24 1.49 4.327.993 1.088 2.334 1.608 4.047 1.608 1.118 0 2.036-.283 2.757-.875v-3.31h-2.459v-2.578h5.612v7.591c-.745.568-1.713 1.04-2.905 1.348a13 13 0 0 1-3.526.497c-2.533 0-4.57-.78-6.06-2.389-1.489-1.584-2.234-3.689-2.234-6.29s.82-4.73 2.434-6.362c1.638-1.632 3.824-2.46 6.555-2.46 1.962 0 3.625.568 4.991 1.68M213.718 144.832v3.973h5.885v2.554h-5.885v5.06h8.046v2.673h-11.2v-16.91h11.349v2.65zM241.253 159.092h-3.054l-1.838-9.105-3.576 9.341h-1.117l-3.6-9.34-1.913 9.104h-3.03l3.577-16.91h1.663l3.85 11.4 3.749-11.4h1.664zM246.347 144.832v3.973h5.885v2.554h-5.885v5.06h8.045v2.673h-11.199v-16.91h11.348v2.65zM257.393 142.183h3.153v16.909h-3.153zM275.876 159.328l-8.617-10.713v10.477h-3.03v-16.91h1.515l8.393 10.194v-10.193h3.03v17.145zM284.752 159.092h-3.948v-16.91c2.508-.07 4.097-.117 4.742-.117 2.583 0 4.644.71 6.159 2.152s2.284 3.358 2.284 5.746c0 6.078-3.079 9.129-9.237 9.129m-.795-14.284v11.54c.522.048 1.068.072 1.664.072 1.59 0 2.83-.544 3.725-1.656.918-1.088 1.365-2.625 1.365-4.611 0-3.619-1.763-5.416-5.314-5.416-.322 0-.819.024-1.44.07M299.914 144.832v3.973h5.885v2.554h-5.885v5.06h8.045v2.673h-11.2v-16.91h11.349v2.65z"
            />
          </Svg>
        </View>
        <Text style={styles.title}>Teilnehmerliste - {eventTitle}</Text>
        {eventDate && <Text style={styles.eventInfo}>{eventDate}</Text>}
        <Text style={styles.summary}>
          Gesamt: {allChildren.length} {allChildren.length === 1 ? 'Kind' : 'Kinder'}
        </Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol1}>
              <Text style={styles.headerText}>Nr.</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.headerText}>Geburtsdatum</Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.headerText}>Alter</Text>
            </View>
            <View style={styles.tableCol5}>
              <Text style={styles.headerText}>Abholung</Text>
            </View>
            <View style={styles.tableCol6}>
              <Text style={styles.headerText}>Elternteil</Text>
            </View>
            <View style={styles.tableCol7}>
              <Text style={styles.headerText}>Kontakt</Text>
            </View>
            <View style={styles.tableCol8}>
              <Text style={styles.headerText}>
                <Check />
              </Text>
            </View>
          </View>

          {/* Table Rows */}
          {allChildren.map((child, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.tableCol1}>
                <Text style={styles.cellText}>{index + 1}</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.cellText}>
                  {child.firstName} {child.lastName}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.cellText}>
                  {child.dateOfBirth ? formatDate(new Date(child.dateOfBirth), 'dd.MM.yyyy') : '-'}
                </Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.cellText}>{child.age ? `${child.age} J.` : '-'}</Text>
              </View>
              <View style={styles.tableCol5}>
                <Text style={styles.cellText}>
                  {child.pickupInfo ? pickupLabels[child.pickupInfo] : '-'}
                </Text>
              </View>
              <View style={styles.tableCol6}>
                <Text style={styles.cellText}>{child.parentName}</Text>
              </View>
              <View style={styles.tableCol7}>
                <Text style={styles.cellText}>{child.parentPhone || child.parentEmail}</Text>
              </View>
              <View style={styles.tableCol8}>
                <View style={styles.checkbox} />
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
