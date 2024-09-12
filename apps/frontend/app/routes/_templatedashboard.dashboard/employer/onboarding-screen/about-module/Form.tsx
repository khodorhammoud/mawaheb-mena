import { BsCurrencyDollar } from "react-icons/bs";
import { Button } from "../../../../../components/ui/button"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";

import {
    Dialog,
    DialogTrigger,
} from "../../../../../components/ui/dialog";

import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "~/components/ui/dialog";

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export default function BudgetModuleForm() {
    return (
        <>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Years in Business</CardTitle>
                </CardHeader>
                <CardContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><BsCurrencyDollar /> Add Average Budget</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white">
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        defaultValue="Pedro Duarte"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        defaultValue="@peduarte"
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>

            </Card>
        </>
    );
}