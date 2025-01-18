import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "~/auth/session.server";

// Create an instance of the authenticator
export const authenticator = new Authenticator(sessionStorage);

// Configure Google Strategy
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Here you should lookup or create a user in your database
    // and return the user data
    console.log("Google profile:", profile);
    /* 
    Google profile: {
  provider: 'google',
  id: '102227545342146370550',
  displayName: 'Khodor Hammoud',
  name: { familyName: 'Hammoud', givenName: 'Khodor' },
  emails: [ { value: 'khodorhammoud94@gmail.com' } ],
  photos: [
    {
      value: 'https://lh3.googleusercontent.com/a/ACg8ocJ1EafrKXuJM8tVj0DreOk_zwzjDFY_rqT2dvcvx7dWx22EbcfY=s96-c'       
    }
  ],
  _json: {
    sub: '102227545342146370550',
    name: 'Khodor Hammoud',
    given_name: 'Khodor',
    family_name: 'Hammoud',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocJ1EafrKXuJM8tVj0DreOk_zwzjDFY_rqT2dvcvx7dWx22EbcfY=s96-c',      
    email: 'khodorhammoud94@gmail.com',
    email_verified: true
  }
}
    */
    return profile;
  }
);

authenticator.use(googleStrategy);
