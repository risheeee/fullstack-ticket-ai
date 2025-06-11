import {inngest} from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import {sendMail} from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
    {id: "on-uer-signup", retries: 2},
    {event: "user/signup"},
    async ({event, step}) => {
        try {
            const {email} = event.data;
            const user = await step.run("get-user-email", async () => {
                const userObject = await User.findOne({email});
                if(!userObject) {
                    throw new NonRetriableError("User dosen't exists in our database");
                }
                return userObject
            });

            await step.run("send-welcome-email", async () => {
                const subject = `Welcome to the app`;
                const message = `Hi, thanks for signing up.`;
                await sendMail(user.email, subject, message);
            })

            return {success: true};

        } catch (error) {
            console.error("❌ Error runinng step", error.message);
            return {success: false};
        }
    }
);