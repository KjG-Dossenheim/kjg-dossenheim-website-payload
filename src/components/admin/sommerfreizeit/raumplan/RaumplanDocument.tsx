import React from 'react'
import { Page, Text, View, Document, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer'
import type { RoomPlanData, TeamerOccupant, UnassignedChild } from './types'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#005e7e',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005e7e',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
    fontSize: 10,
    color: '#555',
  },
  summaryItem: {
    marginRight: 24,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 14,
  },
  floorHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#005e7e',
    backgroundColor: '#f0f4f8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 3,
  },
  floorGender: {
    color: '#666',
    fontSize: 10,
  },
  roomBlock: {
    marginBottom: 10,
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#005e7e',
    borderLeftStyle: 'solid',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 6,
  },
  roomName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#222',
  },
  roomMeta: {
    fontSize: 9,
    color: '#666',
  },
  roomGender: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  capacityOver: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  capacityWarn: {
    color: '#d97706',
  },
  capacityOk: {
    color: '#666',
  },
  occupantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingLeft: 12,
    gap: 6,
  },
  occupantIndex: {
    width: 18,
    fontSize: 8,
    color: '#999',
    textAlign: 'right',
  },
  occupantName: {
    fontSize: 9,
    width: 120,
  },
  occupantAge: {
    fontSize: 8,
    color: '#666',
    width: 30,
  },
  occupantGender: {
    fontSize: 8,
    width: 16,
    textAlign: 'center',
  },
  occupantWish: {
    fontSize: 7,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyRoom: {
    fontSize: 8,
    color: '#999',
    fontStyle: 'italic',
    paddingLeft: 12,
    paddingVertical: 2,
  },
  unassignedSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderTopStyle: 'solid',
  },
  unassignedHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  unassignedSubHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
    marginTop: 6,
  },
  unassignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingLeft: 8,
    gap: 6,
  },
  unassignedBullet: {
    width: 10,
    fontSize: 8,
    color: '#999',
  },
  unassignedName: {
    fontSize: 9,
    width: 120,
  },
  unassignedAge: {
    fontSize: 8,
    color: '#666',
    width: 30,
  },
  unassignedGender: {
    fontSize: 8,
    width: 16,
    textAlign: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    fontSize: 7,
    color: '#bbb',
  },
  genderMale: {
    color: '#2563eb',
  },
  genderFemale: {
    color: '#db2777',
  },
  genderDiverse: {
    color: '#d97706',
  },
})

// ── Lucide-static icons rendered as @react-pdf/renderer Svg ──

function MarsIcon({ size = 10, color }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={color ? { color } : undefined}>
      <Path
        d="M16 3h5v5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="m21 3-6.75 6.75"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth={2} fill="none" />
    </Svg>
  )
}

function VenusIcon({ size = 10, color }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={color ? { color } : undefined}>
      <Path
        d="M12 15v7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9 19h6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth={2} fill="none" />
    </Svg>
  )
}

function GenderSymbol({
  gender,
  size = 10,
}: {
  gender: 'male' | 'female' | 'diverse'
  size?: number
}) {
  if (gender === 'male') return <MarsIcon size={size} />
  if (gender === 'female') return <VenusIcon size={size} />
  return <Text style={{ ...styles.occupantGender, color: styles.genderDiverse.color }}>⚥</Text>
}

function OccupantRow({
  index,
  firstName,
  lastName,
  childAge,
  childGender,
}: {
  index: number
  firstName: string
  lastName: string
  childAge: number | null
  childGender: 'male' | 'female' | 'diverse'
}) {
  return (
    <View style={styles.occupantRow} wrap={false}>
      <Text style={styles.occupantIndex}>{index}.</Text>
      <Text style={styles.occupantName}>
        {firstName} {lastName}
      </Text>
      {childAge != null ? (
        <Text style={styles.occupantAge}>{childAge} J.</Text>
      ) : (
        <Text style={styles.occupantAge} />
      )}
      <GenderSymbol gender={childGender} />
    </View>
  )
}

function UnassignedRow({ child }: { child: UnassignedChild }) {
  return (
    <View style={styles.unassignedRow} wrap={false}>
      <Text style={styles.unassignedBullet}>•</Text>
      <Text style={styles.unassignedName}>
        {child.firstName} {child.lastName}
      </Text>
      {child.age != null ? (
        <Text style={styles.unassignedAge}>{child.age} J.</Text>
      ) : (
        <Text style={styles.unassignedAge} />
      )}
      <GenderSymbol gender={child.childGender} />
    </View>
  )
}

function TeamerRow({
  index,
  firstName,
  lastName,
  gender,
}: {
  index: number
  firstName: string
  lastName: string
  gender: 'male' | 'female'
}) {
  return (
    <View style={styles.occupantRow} wrap={false}>
      <Text style={styles.occupantIndex}>{index}.</Text>
      <Text style={styles.occupantName}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.occupantAge} />
      <GenderSymbol gender={gender} />
    </View>
  )
}

function UnassignedTeamerRow({ teamer }: { teamer: TeamerOccupant }) {
  return (
    <View style={styles.unassignedRow} wrap={false}>
      <Text style={styles.unassignedBullet}>•</Text>
      <Text style={styles.unassignedName}>
        {teamer.firstName} {teamer.lastName}
      </Text>
      <Text style={styles.unassignedAge} />
      <GenderSymbol gender={teamer.gender} />
    </View>
  )
}

export function RaumplanDocument({ data }: { data: RoomPlanData }) {
  const totalChildren = data.rooms.reduce((sum, r) => sum + r.occupants.length, 0)
  const totalTeamers = data.rooms.reduce((sum, r) => sum + r.teamerOccupants.length, 0)
  const totalOccupants = totalChildren + totalTeamers
  const totalCapacity = data.rooms.reduce((sum, r) => sum + (r.capacity ?? 0), 0)

  // Group rooms by floor
  const floorGroups = (() => {
    const groups = new Map<
      string,
      {
        floorId: string | null
        floorName: string
        floorGender: 'male' | 'female' | null
        rooms: typeof data.rooms
      }
    >()

    for (const room of data.rooms) {
      const key = room.floorId ?? '__none__'
      if (!groups.has(key)) {
        groups.set(key, {
          floorId: room.floorId ?? null,
          floorName: room.floorName ?? 'Ohne Etage',
          floorGender: room.floorGender ?? null,
          rooms: [],
        })
      }
      groups.get(key)!.rooms.push(room)
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.floorId === null) return 1
      if (b.floorId === null) return -1
      return a.floorName.localeCompare(b.floorName, 'de')
    })
  })()

  return (
    <Document>
      {floorGroups.map((group, index) => (
        <Page
          key={group.floorId ?? '__none__'}
          size="A4"
          orientation="landscape"
          style={styles.page}
        >
          {/* Header — only on first page */}
          {index === 0 && (
            <View style={styles.header}>
              <Text style={styles.title}>Raumplan</Text>
              <Text style={styles.eventName}>{data.eventName}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{data.rooms.length}</Text> Zimmer
                </Text>
                {totalCapacity > 0 && (
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{totalCapacity}</Text> Betten
                  </Text>
                )}
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{totalOccupants}</Text>{' '}
                  {totalOccupants === 1 ? 'Bewohner' : 'Bewohner'}
                </Text>
                {totalTeamers > 0 && (
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{totalTeamers}</Text> Teamer
                  </Text>
                )}
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{data.unassigned.length}</Text> nicht zugewiesen
                </Text>
                {data.unassignedTeamers.length > 0 && (
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{data.unassignedTeamers.length}</Text> Teamer
                    nicht zugewiesen
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Floor section */}
          <View style={styles.section}>
            <View style={styles.floorHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text>{group.floorName}</Text>
                {group.floorGender && (
                  <>
                    <Text style={styles.floorGender}> (</Text>
                    {group.floorGender === 'male' ? (
                      <MarsIcon size={10} />
                    ) : (
                      <VenusIcon size={10} />
                    )}
                    <Text style={styles.floorGender}>)</Text>
                  </>
                )}
              </View>
            </View>

            {group.rooms.map((room) => {
              const occupantCount = room.occupants.length
              const capacityStyle = room.capacity
                ? occupantCount > room.capacity
                  ? styles.capacityOver
                  : occupantCount >= room.capacity * 0.8
                    ? styles.capacityWarn
                    : styles.capacityOk
                : styles.capacityOk

              return (
                <View key={room.id} style={styles.roomBlock} wrap={false}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    {room.gender &&
                      (room.gender === 'male' ? (
                        <MarsIcon size={12} color={styles.genderMale.color} />
                      ) : (
                        <VenusIcon size={12} color={styles.genderFemale.color} />
                      ))}
                    {room.genderConflict && (
                      <Text style={{ fontSize: 8, color: '#d97706' }}>⚠ Gemischte Belegung</Text>
                    )}
                    <Text style={{ ...styles.roomMeta, ...capacityStyle }}>
                      ({occupantCount}
                      {room.capacity ? ` / ${room.capacity}` : ''})
                    </Text>
                    {room.beschreibung && <Text style={styles.roomMeta}>{room.beschreibung}</Text>}
                  </View>

                  {room.occupants.length === 0 && room.teamerOccupants.length === 0 ? (
                    <Text style={styles.emptyRoom}>leer</Text>
                  ) : (
                    <>
                      {room.occupants.map((occ, idx) => (
                        <OccupantRow
                          key={occ.id}
                          index={idx + 1}
                          firstName={occ.firstName}
                          lastName={occ.lastName}
                          childAge={occ.age}
                          childGender={occ.childGender}
                        />
                      ))}
                      {room.teamerOccupants.map((t, idx) => (
                        <TeamerRow
                          key={t.id}
                          index={room.occupants.length + idx + 1}
                          firstName={t.firstName}
                          lastName={t.lastName}
                          gender={t.gender}
                        />
                      ))}
                    </>
                  )}
                </View>
              )
            })}
          </View>

          {/* Unassigned — only on last page */}
          {index === floorGroups.length - 1 &&
            (data.unassigned.length > 0 || data.unassignedTeamers.length > 0) && (
              <View style={styles.unassignedSection}>
                <Text style={styles.unassignedHeader}>
                  Nicht zugewiesen ({data.unassigned.length + data.unassignedTeamers.length})
                </Text>
                {data.unassigned.length > 0 && (
                  <>
                    <Text style={styles.unassignedSubHeader}>
                      Kinder ({data.unassigned.length})
                    </Text>
                    {data.unassigned.map((child) => (
                      <UnassignedRow key={child.id} child={child} />
                    ))}
                  </>
                )}
                {data.unassignedTeamers.length > 0 && (
                  <>
                    <Text style={styles.unassignedSubHeader}>
                      Teamer ({data.unassignedTeamers.length})
                    </Text>
                    {data.unassignedTeamers.map((t) => (
                      <UnassignedTeamerRow key={t.id} teamer={t} />
                    ))}
                  </>
                )}
              </View>
            )}

          {/* Page number */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`}
            fixed
          />
          <Text style={styles.footer} fixed>
            KjG Dossenheim — Raumplan — {data.eventName}
          </Text>
        </Page>
      ))}
    </Document>
  )
}
