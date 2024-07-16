import LayoutContainer from "../../common/layout_container";
import { useNavigate } from "@remix-run/react";

export default function ForFreelancersPage() {
	const navigate = useNavigate();
	return (
		<LayoutContainer>
			<div className="text-left my-[60px]">
				<h1>For freelancers content here</h1>
			</div>
		</LayoutContainer>
	);
}
