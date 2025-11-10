import { Section, Row, Column, Img, Link } from '@react-email/components'

export const MailHeader = () => (
  <Section className="bg-primary my-[40px] px-[32px] py-[40px]">
    <Row>
      <Column align="center">
        <Img
          alt="React Email logo"
          height="42"
          src="https://react.email/static/logo-without-background.png"
        />
      </Column>
    </Row>
    <Row className="mt-[40px]">
      <Column align="center">
        <table>
          <tr>
            <td className="px-[8px]">
              <Link
                className="[text-decoration:none]"
                href={process.env.NEXT_PUBLIC_SITE_URL + '/about' || '#'}
              >
                Über uns
              </Link>
            </td>
            <td className="px-[8px]">
              <Link
                className="[text-decoration:none]"
                href={process.env.NEXT_PUBLIC_SITE_URL + '/blog' || '#'}
              >
                Blog
              </Link>
            </td>
            <td className="px-[8px]">
              <Link
                className="[text-decoration:none]"
                href={process.env.NEXT_PUBLIC_SITE_URL + '/team' || '#'}
              >
                Team
              </Link>
            </td>
            <td className="px-[8px]">
              <Link
                className="[text-decoration:none]"
                href={process.env.NEXT_PUBLIC_SITE_URL + '/aktionen' || '#'}
              >
                Aktionen
              </Link>
            </td>
          </tr>
        </table>
      </Column>
    </Row>
  </Section>
)
