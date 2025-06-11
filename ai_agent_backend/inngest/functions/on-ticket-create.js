import {inngest} from "../client.js"
import Ticket from "../../models/ticket.js"
import User from "../../models/user.js"
import { NonRetriableError } from "inngest"
import {sendMail} from "../../utils/mailer.js"
import analyzeTicket from "../../utils/ai.js"

export const onTicketCreated = inngest.createFunction(
    {id: "on-ticket-created", reetires: 2},
    {event: "ticket/created"},
    async ({event, step}) => {
        try {
            const {ticketId} = event.data;
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId);
                if(!ticket) throw new NonRetriableError("tiket not founf");
                return ticketObject;
            });

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"});
            });

            const aiResponse = await analyzeTicket(ticket);

            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = [];
                if(aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        prioriy: !["low", "medium", "high"].includes(aiResponse.prioriy)
                        ? "medium"
                        : aiResponse.prioriy,
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills,
                    });
                    skills = aiResponse.relatedSkills;
                }
                return skills;
            });

            const moderator = await step.run("assign-moderator", async () => {
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i",
                        },
                    },
                });
                if(!user) {
                    user = await User.findOne({
                        role: "admin",
                    });
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                });
                return user;
            });

            await step.run("send-email-notification", async () => {
                if(moderator) {
                    const finalTicket = await Ticket.findById(ticket._id);
                    await sendMail(
                        moderator.email,
                        "Ticket assigned",
                        `A new ticket is assiged to you ${finalTicket.title}`
                    );
                }
            });
            return {success:true};
        } catch (error) {
            console.error("error running the step", error.message);
            return {success: false};
        }
    }
);