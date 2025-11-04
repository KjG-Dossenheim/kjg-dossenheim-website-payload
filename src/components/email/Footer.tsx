import { Section, Img, Text, Row, Column, Link } from '@react-email/components'

export const MailFooter = () => (
  <Section className="text-center">
    <table className="w-full">
      <tr className="w-full">
        <td align="center">
          <Img
            alt="React Email logo"
            height="42"
            src="https://react.email/static/logo-without-background.png"
          />
        </td>
      </tr>
      <tr className="w-full">
        <td align="center">
          <Text className="my-[8px] text-[16px] leading-[24px] font-semibold text-gray-900">
            {process.env.NEXT_PUBLIC_SITE_NAME}
          </Text>
        </td>
      </tr>
      <tr>
        <td align="center">
          <Row className="table-cell h-[44px] w-[56px] align-bottom">
            <Column className="pr-[8px]">
              <Link href="https://www.facebook.com/kjg.dossenheim/">
                <Img
                  alt="Facebook"
                  height="36"
                  src="https://react.email/static/facebook-logo.png"
                  width="36"
                />
              </Link>
            </Column>
            <Column>
              <Link href="https://www.instagram.com/kjg.dossenheim/">
                <Img
                  alt="Instagram"
                  height="36"
                  src="https://react.email/static/instagram-logo.png"
                  width="36"
                />
              </Link>
            </Column>
          </Row>
        </td>
      </tr>
      <tr>
        <td align="center">
          <Text className="my-[8px] text-[16px] leading-[24px] font-semibold text-gray-500">
            Anne Frank Straße 22, 69221 Dossenheim
          </Text>
          <Text className="mt-[4px] mb-0 text-[16px] leading-[24px] font-semibold text-gray-500">
            info@kjg-dossenheim.org
          </Text>
        </td>
      </tr>
    </table>
  </Section>
)
