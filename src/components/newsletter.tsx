import * as React from 'react'
import { Button } from '@/components/ui/button'

export function Newsletter() {
  return (
    <section>
      <div>
        <div className="sm:text-center">
          <h2 className="text-3xl font-extrabold">Stay in the loop</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Sign up for our newsletter to stay up to date on the latest news and events.
          </p>
        </div>
        <form
          method="post"
          action="https://listmonk.kjg-dossenheim.org/subscription/form"
          className="container mx-auto"
        >
          <div>
            <input type="hidden" name="nonce" />
            <p>
              <input type="email" name="email" required placeholder="E-Mail" />
            </p>
            <p>
              <input type="text" name="name" placeholder="Name (optional)" />
            </p>
            <p>
              <input
                id="bc96a"
                type="checkbox"
                name="l"
                checked
                value="bc96acee-96da-4222-8c94-6d1f12bb9563"
              />
              <label htmlFor="bc96a">Allgemein</label>
            </p>
            <div className="h-captcha" data-sitekey="cad8db93-7a15-412d-9339-c091d6643a64"></div>
            <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
            <Button>
              <input type="submit" value="Abonnieren" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
